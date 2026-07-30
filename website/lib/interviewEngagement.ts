import { supabaseAdmin } from "@/lib/supabase-admin";
import { computeStreakUpdate } from "@/lib/learningStreak";
import { checkAndAwardAchievements } from "@/lib/achievements";

/**
 * Every completed interview attempt credits the same shared streak +
 * minutes fields used by Learning/Practice (deliberately not a separate
 * interview-specific counter — see the plan for why). Interview-specific
 * "total practice time" is computed live elsewhere by summing
 * interview_attempts.time_taken_seconds, not stored here.
 */
export async function creditInterviewEngagement(userId: string, timeTakenSeconds: number) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("current_streak, longest_streak, last_activity_date, total_learning_minutes")
    .eq("id", userId)
    .maybeSingle();

  const streak = computeStreakUpdate({
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    lastActivityDate: profile?.last_activity_date ?? null,
  });

  const minutesEarned = Math.max(1, Math.round(timeTakenSeconds / 60));

  await supabaseAdmin
    .from("profiles")
    .update({
      current_streak: streak.currentStreak,
      longest_streak: streak.longestStreak,
      last_activity_date: streak.lastActivityDate,
      total_learning_minutes: (profile?.total_learning_minutes ?? 0) + minutesEarned,
    })
    .eq("id", userId);

  await checkAndAwardAchievements(userId);
}
