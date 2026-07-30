import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCompletedCourses, countCompletedQuestions } from "@/lib/progressAggregation";

/**
 * Re-checks a user's current state against every achievement's criteria
 * and awards any newly-met ones. Safe to call repeatedly (e.g. on every
 * quiz attempt, not just newly-passing ones) — already-earned
 * achievements are skipped via `ignoreDuplicates`, so there's no
 * duplicate-row or error risk from re-checking.
 *
 * Only queries the underlying signal for achievements the user hasn't
 * already earned — once all 6 are earned, this is just the 2 lookups
 * below and returns immediately, instead of always recomputing every
 * metric (lesson/quiz counts, completed courses, questions solved) on
 * every single lesson/quiz/practice completion.
 */
export async function checkAndAwardAchievements(userId: string): Promise<void> {
  const [{ data: catalog }, { data: earned }] = await Promise.all([
    supabaseAdmin.from("achievements").select("id, slug"),
    supabaseAdmin.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);

  const earnedIds = new Set((earned ?? []).map((r) => r.achievement_id));
  const idFor = (slug: string) => (catalog ?? []).find((a) => a.slug === slug)?.id;
  const isEarned = (slug: string) => {
    const id = idFor(slug);
    return !id || earnedIds.has(id);
  };

  const needsLesson = !isEarned("first-lesson-completed");
  const needsQuizPass = !isEarned("first-quiz-passed");
  const needsStreak = !isEarned("seven-day-streak") || !isEarned("thirty-day-streak");
  const needsCourse = !isEarned("first-course-completed");
  const needsQuestions = !isEarned("hundred-questions-solved");

  if (!needsLesson && !needsQuizPass && !needsStreak && !needsCourse && !needsQuestions) {
    return;
  }

  const [lessonCountResult, quizPassCountResult, profileResult, completedCourses, questionsSolved] =
    await Promise.all([
      needsLesson
        ? supabaseAdmin
            .from("lesson_progress")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
        : Promise.resolve({ count: 0 }),
      needsQuizPass
        ? supabaseAdmin
            .from("module_progress")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("quiz_passed", true)
        : Promise.resolve({ count: 0 }),
      needsStreak
        ? supabaseAdmin.from("profiles").select("longest_streak").eq("id", userId).maybeSingle()
        : Promise.resolve({ data: null }),
      needsCourse ? getCompletedCourses(supabaseAdmin, userId) : Promise.resolve([]),
      needsQuestions ? countCompletedQuestions(supabaseAdmin, userId) : Promise.resolve(0),
    ]);

  const toAward: { user_id: string; achievement_id: string }[] = [];

  const maybeAward = (slug: string, met: boolean) => {
    const id = idFor(slug);
    if (id && met && !earnedIds.has(id)) {
      toAward.push({ user_id: userId, achievement_id: id });
    }
  };

  if (needsLesson) maybeAward("first-lesson-completed", (lessonCountResult.count ?? 0) >= 1);
  if (needsQuizPass) maybeAward("first-quiz-passed", (quizPassCountResult.count ?? 0) >= 1);
  if (needsStreak) {
    const longestStreak = profileResult.data?.longest_streak ?? 0;
    maybeAward("seven-day-streak", longestStreak >= 7);
    maybeAward("thirty-day-streak", longestStreak >= 30);
  }
  if (needsCourse) maybeAward("first-course-completed", completedCourses.length >= 1);
  if (needsQuestions) maybeAward("hundred-questions-solved", questionsSolved >= 100);

  if (toAward.length === 0) return;

  await supabaseAdmin
    .from("user_achievements")
    .upsert(toAward, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
}
