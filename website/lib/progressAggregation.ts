import type { SupabaseClient } from "@supabase/supabase-js";

export interface CompletedCourse {
  courseId: string;
  courseTitle: string;
  completedAt: string;
}

/**
 * A course is "completed" when every one of its modules has a passed
 * quiz (every module has exactly one quiz). Its completion timestamp is
 * the highest-sort_order module's module_progress.completed_at.
 */
export async function getCompletedCourses(
  supabase: SupabaseClient,
  userId: string
): Promise<CompletedCourse[]> {
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, course_modules(id, sort_order)");

  if (!courses || courses.length === 0) return [];

  const allModuleIds = courses.flatMap(
    (c) => (c.course_modules ?? []).map((m: { id: string }) => m.id)
  );

  if (allModuleIds.length === 0) return [];

  const { data: progressRows } = await supabase
    .from("module_progress")
    .select("module_id, completed_at")
    .eq("user_id", userId)
    .eq("quiz_passed", true)
    .in("module_id", allModuleIds);

  const completedAtByModuleId = new Map(
    (progressRows ?? []).map((r) => [r.module_id, r.completed_at as string])
  );

  const completed: CompletedCourse[] = [];

  for (const course of courses) {
    const modules = (course.course_modules ?? []) as { id: string; sort_order: number }[];
    if (modules.length === 0) continue;

    const allPassed = modules.every((m) => completedAtByModuleId.has(m.id));
    if (!allPassed) continue;

    const lastModule = [...modules].sort((a, b) => b.sort_order - a.sort_order)[0];

    completed.push({
      courseId: course.id,
      courseTitle: course.title,
      completedAt: completedAtByModuleId.get(lastModule.id)!,
    });
  }

  return completed;
}

/** Same math as app/api/practice/analytics/route.ts's totalQuestionsSolved. */
export async function countCompletedQuestions(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const [{ data: topicAttempts }, { data: mockAttempts }] = await Promise.all([
    supabase
      .from("practice_attempts")
      .select("total_questions")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("mock_test_attempts")
      .select("total_questions")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  const sum = (rows: { total_questions: number }[] | null) =>
    (rows ?? []).reduce((total, row) => total + row.total_questions, 0);

  return sum(topicAttempts) + sum(mockAttempts);
}

function toDateString(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Distinct calendar dates across every timestamped activity signal. */
export async function countDistinctActiveDays(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const [
    { data: lessons },
    { data: quizzes },
    { data: practice },
    { data: mock },
  ] = await Promise.all([
    supabase.from("lesson_progress").select("completed_at").eq("user_id", userId),
    supabase.from("quiz_attempts").select("attempted_at").eq("user_id", userId),
    supabase
      .from("practice_attempts")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("mock_test_attempts")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  const dates = new Set<string>();

  for (const row of lessons ?? []) dates.add(toDateString(row.completed_at));
  for (const row of quizzes ?? []) dates.add(toDateString(row.attempted_at));
  for (const row of practice ?? []) if (row.completed_at) dates.add(toDateString(row.completed_at));
  for (const row of mock ?? []) if (row.completed_at) dates.add(toDateString(row.completed_at));

  return dates.size;
}
