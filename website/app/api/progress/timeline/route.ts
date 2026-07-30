import { getServerSupabase } from "@/lib/supabaseServer";
import { getCompletedCourses } from "@/lib/progressAggregation";
import type { TimelineEntry } from "@/types/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [
      { data: lessonCompletions },
      { data: quizPasses },
      { data: mockCompletions },
      { data: practiceCompletions },
      completedCourses,
    ] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("completed_at, lessons(title)")
        .eq("user_id", user.id),
      supabase
        .from("quiz_attempts")
        .select("attempted_at, quizzes(title)")
        .eq("user_id", user.id)
        .eq("passed", true),
      supabase
        .from("mock_test_attempts")
        .select("completed_at, mock_tests(title)")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("practice_attempts")
        .select("completed_at, practice_topics(title)")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      getCompletedCourses(supabase, user.id),
    ]);

    const entries: TimelineEntry[] = [];

    for (const row of lessonCompletions ?? []) {
      const lesson = row.lessons as unknown as { title: string } | null;
      if (!lesson) continue;
      entries.push({
        kind: "lesson_completed",
        title: `Completed Lesson: ${lesson.title}`,
        occurredAt: row.completed_at,
      });
    }

    for (const row of quizPasses ?? []) {
      const quiz = row.quizzes as unknown as { title: string } | null;
      if (!quiz) continue;
      entries.push({
        kind: "quiz_passed",
        title: `Passed Quiz: ${quiz.title}`,
        occurredAt: row.attempted_at,
      });
    }

    for (const row of mockCompletions ?? []) {
      const mockTest = row.mock_tests as unknown as { title: string } | null;
      if (!mockTest || !row.completed_at) continue;
      entries.push({
        kind: "mock_test_completed",
        title: `Finished Mock Test: ${mockTest.title}`,
        occurredAt: row.completed_at,
      });
    }

    for (const row of practiceCompletions ?? []) {
      const topic = row.practice_topics as unknown as { title: string } | null;
      if (!topic || !row.completed_at) continue;
      entries.push({
        kind: "practice_completed",
        title: `Completed Practice: ${topic.title}`,
        occurredAt: row.completed_at,
      });
    }

    for (const course of completedCourses) {
      entries.push({
        kind: "course_completed",
        title: `Completed Course: ${course.courseTitle}`,
        occurredAt: course.completedAt,
      });
    }

    entries.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return Response.json({ success: true, entries });
  } catch (error) {
    console.error("Progress timeline error:", error);

    return Response.json(
      { success: false, message: "Failed to load timeline." },
      { status: 500 }
    );
  }
}
