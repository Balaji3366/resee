import { getServerSupabase } from "@/lib/supabaseServer";
import { getCompletedCourses } from "@/lib/progressAggregation";
import type { DayActivityPoint, MonthActivityPoint, ProgressActivity } from "@/types/progress";

export const dynamic = "force-dynamic";

function toDateString(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function toMonthString(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function last7Dates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

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
      { data: quizAttempts },
      { data: practiceAttempts },
      { data: mockAttempts },
      { data: modulesPassed },
      completedCourses,
    ] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("completed_at, lessons(estimated_minutes)")
        .eq("user_id", user.id),
      supabase
        .from("quiz_attempts")
        .select("module_id, quiz_id, attempted_at, passed")
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: true }),
      supabase
        .from("practice_attempts")
        .select("completed_at, time_taken_seconds")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("mock_test_attempts")
        .select("completed_at, time_taken_seconds")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("module_progress")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("quiz_passed", true),
      getCompletedCourses(supabase, user.id),
    ]);

    // ---- Weekly: fixed 7-day window, zero-filled ----
    const week = last7Dates();
    const learningByDate = new Map<string, number>();
    const practiceByDate = new Map<string, number>();

    for (const row of lessonCompletions ?? []) {
      const date = toDateString(row.completed_at);
      learningByDate.set(date, (learningByDate.get(date) ?? 0) + 1);
    }

    for (const row of quizAttempts ?? []) {
      const date = toDateString(row.attempted_at);
      learningByDate.set(date, (learningByDate.get(date) ?? 0) + 1);
    }

    for (const row of practiceAttempts ?? []) {
      if (!row.completed_at) continue;
      const date = toDateString(row.completed_at);
      practiceByDate.set(date, (practiceByDate.get(date) ?? 0) + 1);
    }

    for (const row of mockAttempts ?? []) {
      if (!row.completed_at) continue;
      const date = toDateString(row.completed_at);
      practiceByDate.set(date, (practiceByDate.get(date) ?? 0) + 1);
    }

    const weekly: DayActivityPoint[] = week.map((date) => ({
      date,
      learningEvents: learningByDate.get(date) ?? 0,
      practiceEvents: practiceByDate.get(date) ?? 0,
    }));

    // ---- Monthly: Learning Hours (first-ever passing attempt per module,
    // to match what actually credited total_learning_minutes), Practice
    // Time, Completed Courses, Completed Modules ----
    const learningMinutesByMonth = new Map<string, number>();

    for (const row of lessonCompletions ?? []) {
      const lessons = row.lessons as unknown as { estimated_minutes: number } | null;
      if (!lessons) continue;
      const month = toMonthString(row.completed_at);
      learningMinutesByMonth.set(
        month,
        (learningMinutesByMonth.get(month) ?? 0) + lessons.estimated_minutes
      );
    }

    const firstPassByModule = new Map<string, { quizId: string; attemptedAt: string }>();
    for (const row of quizAttempts ?? []) {
      if (!row.passed) continue;
      if (!firstPassByModule.has(row.module_id)) {
        firstPassByModule.set(row.module_id, { quizId: row.quiz_id, attemptedAt: row.attempted_at });
      }
    }

    const firstPassQuizIds = Array.from(firstPassByModule.values()).map((v) => v.quizId);

    const { data: quizMinutesRows } = firstPassQuizIds.length
      ? await supabase.from("quizzes").select("id, estimated_minutes").in("id", firstPassQuizIds)
      : { data: [] };

    const quizMinutesById = new Map((quizMinutesRows ?? []).map((q) => [q.id, q.estimated_minutes]));

    for (const { quizId, attemptedAt } of firstPassByModule.values()) {
      const minutes = quizMinutesById.get(quizId) ?? 0;
      const month = toMonthString(attemptedAt);
      learningMinutesByMonth.set(month, (learningMinutesByMonth.get(month) ?? 0) + minutes);
    }

    const practiceMinutesByMonth = new Map<string, number>();

    for (const row of [...(practiceAttempts ?? []), ...(mockAttempts ?? [])]) {
      if (!row.completed_at) continue;
      const month = toMonthString(row.completed_at);
      practiceMinutesByMonth.set(
        month,
        (practiceMinutesByMonth.get(month) ?? 0) + (row.time_taken_seconds ?? 0) / 60
      );
    }

    const completedCoursesByMonth = new Map<string, number>();
    for (const course of completedCourses) {
      const month = toMonthString(course.completedAt);
      completedCoursesByMonth.set(month, (completedCoursesByMonth.get(month) ?? 0) + 1);
    }

    const completedModulesByMonth = new Map<string, number>();
    for (const row of modulesPassed ?? []) {
      if (!row.completed_at) continue;
      const month = toMonthString(row.completed_at);
      completedModulesByMonth.set(month, (completedModulesByMonth.get(month) ?? 0) + 1);
    }

    const allMonths = new Set([
      ...learningMinutesByMonth.keys(),
      ...practiceMinutesByMonth.keys(),
      ...completedCoursesByMonth.keys(),
      ...completedModulesByMonth.keys(),
    ]);

    const monthly: MonthActivityPoint[] = Array.from(allMonths)
      .sort()
      .map((monthStart) => ({
        monthStart,
        learningHours: Math.round(((learningMinutesByMonth.get(monthStart) ?? 0) / 60) * 10) / 10,
        practiceMinutes: Math.round(practiceMinutesByMonth.get(monthStart) ?? 0),
        completedCourses: completedCoursesByMonth.get(monthStart) ?? 0,
        completedModules: completedModulesByMonth.get(monthStart) ?? 0,
      }));

    const activity: ProgressActivity = { weekly, monthly };

    return Response.json({ success: true, activity });
  } catch (error) {
    console.error("Progress activity error:", error);

    return Response.json(
      { success: false, message: "Failed to load activity." },
      { status: 500 }
    );
  }
}
