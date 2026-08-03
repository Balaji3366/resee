import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface LearningRecommendationCandidate {
  slug: string;
  title: string;
  category: string;
}

export interface LearningRecommendationParams {
  candidates: LearningRecommendationCandidate[];
}

export interface LearningRecommendationResult {
  recommendedCourseSlug: string;
  reason: string;
}

/**
 * Deliberately constrained to a closed candidate list passed in as
 * input — the model picks one, it never invents a course. The caller
 * (app/api/learning/recommendation/route.ts) validates the returned
 * slug against the same candidate list and discards the AI result
 * (falling back to the rule-based recommendation) if it doesn't match,
 * so an invalid or hallucinated slug can never reach the user.
 */
export function buildLearningRecommendationPrompt(
  context: UserContext,
  params: LearningRecommendationParams
): PromptResult {
  const system = `You recommend the single best next course for a learner from a fixed list of real candidates.
You must choose exactly one course from the candidate list below by its exact slug — never invent
a course or slug that isn't in the list.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "recommendedCourseSlug": string (must be one of the candidate slugs, verbatim),
  "reason": string (under 30 words, specific to this learner)
}`;

  const user = `Learner's current progress:
${formatContextBlock({
  completedCourses: context.learning.completedCourseCount,
  overallCompletionPercent: context.learning.overallCompletionPercent,
  weakTopics: context.practice.weakTopics,
  strongTopics: context.practice.strongTopics,
  skillLevel: context.skillLevel,
})}

Candidate courses (choose exactly one slug from this list):
${params.candidates.map((c) => `- slug: "${c.slug}", title: "${c.title}", category: "${c.category}"`).join("\n")}

Recommend the single best course and return the JSON described above.`;

  return { system, user };
}
