import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserContext } from "@/types/ai";
import type { DailyRecommendationActionType } from "@/lib/ai/prompts/dailyRecommendation";

export interface RuleBasedDailyRecommendation {
  message: string;
  suggestedAction: DailyRecommendationActionType;
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The always-available, zero-cost baseline Daily Recommendation
 * (Decision 10) — reuses the real daily_challenge_attempts table
 * (lib/dailyChallenge.ts) and the already-aggregated learning/practice
 * data in UserContext, never an AI call.
 */
export async function getRuleBasedDailyRecommendation(
  supabase: SupabaseClient,
  userId: string,
  context: UserContext
): Promise<RuleBasedDailyRecommendation> {
  const { data: attempt } = await supabase
    .from("daily_challenge_attempts")
    .select("status")
    .eq("user_id", userId)
    .eq("challenge_date", todayISODate())
    .maybeSingle();

  if (!attempt || attempt.status !== "completed") {
    return {
      message: "Complete today's Daily Challenge to keep sharpening your skills.",
      suggestedAction: "daily_challenge",
    };
  }

  if (context.learning.currentStreak > 0) {
    return {
      message: `You're on a ${context.learning.currentStreak}-day streak — keep it alive with today's learning.`,
      suggestedAction: "continue_learning",
    };
  }

  if (context.practice.weakTopics.length > 0) {
    return {
      message: `Practice ${context.practice.weakTopics[0]} today to close your biggest skill gap.`,
      suggestedAction: "practice_weak_topic",
    };
  }

  return {
    message: "Keep up the momentum — check in on your goals today.",
    suggestedAction: "none",
  };
}
