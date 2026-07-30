import { getServerSupabase } from "@/lib/supabaseServer";
import { countCompletedQuestions, countDistinctActiveDays } from "@/lib/progressAggregation";
import type { ProgressOverview } from "@/types/progress";

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
      { count: lessonsCompleted },
      { count: quizzesCompleted },
      { count: quizAttemptCount },
      { count: mockTestsCompleted },
      { data: availableCourses },
      { data: profile },
      questionsSolved,
      totalActiveDays,
    ] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("module_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("quiz_passed", true),
      supabase
        .from("quiz_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("mock_test_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase.from("courses").select("id").eq("is_available", true),
      supabase
        .from("profiles")
        .select("current_streak, longest_streak, total_learning_minutes")
        .eq("id", user.id)
        .maybeSingle(),
      countCompletedQuestions(supabase, user.id),
      countDistinctActiveDays(supabase, user.id),
    ]);

    const availableCourseIds = (availableCourses ?? []).map((c) => c.id);

    const { count: totalLessonsAvailable } = availableCourseIds.length
      ? await supabase
          .from("lessons")
          .select("id", { count: "exact", head: true })
          .in("course_id", availableCourseIds)
      : { count: 0 };

    const { count: practiceCompletedCount } = await supabase
      .from("practice_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed");

    const overview: ProgressOverview = {
      overallCompletionPercent:
        totalLessonsAvailable && totalLessonsAvailable > 0
          ? Math.round(((lessonsCompleted ?? 0) / totalLessonsAvailable) * 100)
          : 0,
      currentStreak: profile?.current_streak ?? 0,
      bestStreak: profile?.longest_streak ?? 0,
      totalLearningHours: Math.round(((profile?.total_learning_minutes ?? 0) / 60) * 10) / 10,
      lessonsCompleted: lessonsCompleted ?? 0,
      quizzesCompleted: quizzesCompleted ?? 0,
      mockTestsCompleted: mockTestsCompleted ?? 0,
      practiceQuestionsSolved: questionsSolved,
      totalActiveDays,
      hasAnyActivity:
        (lessonsCompleted ?? 0) > 0 ||
        (quizAttemptCount ?? 0) > 0 ||
        (practiceCompletedCount ?? 0) > 0 ||
        (mockTestsCompleted ?? 0) > 0,
    };

    return Response.json({ success: true, overview });
  } catch (error) {
    console.error("Progress overview error:", error);

    return Response.json(
      { success: false, message: "Failed to load progress overview." },
      { status: 500 }
    );
  }
}
