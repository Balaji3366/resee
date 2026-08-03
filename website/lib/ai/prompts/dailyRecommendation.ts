import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export type DailyRecommendationActionType =
  "daily_challenge" | "continue_learning" | "practice_weak_topic" | "none";

export interface DailyRecommendationResult {
  message: string;
  suggestedAction: DailyRecommendationActionType;
}

const VALID_ACTIONS: DailyRecommendationActionType[] = [
  "daily_challenge",
  "continue_learning",
  "practice_weak_topic",
  "none",
];

export function isValidDailyRecommendationAction(
  value: unknown
): value is DailyRecommendationActionType {
  return typeof value === "string" && (VALID_ACTIONS as string[]).includes(value);
}

/**
 * Deliberately the smallest-surface prompt in the catalog — the
 * suggestedAction is a closed enum resolved to a static, already-existing
 * route client-side (never a free-form course/topic slug), so there is
 * no catalog-hallucination risk to guard against at all, unlike Learning
 * Recommendation which must validate an AI-chosen slug.
 */
export function buildDailyRecommendationPrompt(context: UserContext): PromptResult {
  const system = `You write one short, motivating daily nudge for a learner, plus a single suggested next action.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "message": string (under 25 words, warm and specific to this learner, not generic),
  "suggestedAction": "daily_challenge" | "continue_learning" | "practice_weak_topic" | "none"
}
Choose "daily_challenge" if a daily challenge is a good fit, "continue_learning" if they have
learning momentum worth continuing, "practice_weak_topic" if a specific weak topic stands out,
or "none" if no specific action fits better than general encouragement.`;

  const user = `Learner's current standing:
${formatContextBlock({
  currentStreak: context.learning.currentStreak,
  longestStreak: context.learning.longestStreak,
  weakTopics: context.practice.weakTopics,
  overallCompletionPercent: context.learning.overallCompletionPercent,
})}

Write today's nudge and return the JSON described above.`;

  return { system, user };
}
