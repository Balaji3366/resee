import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface CareerCoachingParams {
  userMessage: string;
}

export interface CareerCoachingResult {
  reply: string;
  suggestedActions: string[];
}

/**
 * Deliberately NOT a conversational chat prompt — no message history is
 * threaded through here. Each call is a single, context-grounded
 * question answered fresh from the User Context Engine's snapshot, per
 * the "AI should remember career context, not chat history" rule.
 */
export function buildCareerCoachingPrompt(
  context: UserContext,
  params: CareerCoachingParams
): PromptResult {
  const system = `You are a career coach grounded in the candidate's real progress and goals.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "reply": string (under 120 words, direct and encouraging),
  "suggestedActions": string[] (1-3 concrete next steps)
}`;

  const user = `Candidate context:
${formatContextBlock({
  careerGoal: context.careerGoal,
  targetCareer: context.targetCareer,
  skillLevel: context.skillLevel,
  completedCourses: context.learning.completedCourseCount,
  currentStreak: context.learning.currentStreak,
  interviewsCompleted: context.interviews.completedCount,
})}

Candidate's question: ${params.userMessage}

Respond and return the JSON described above.`;

  return { system, user };
}
