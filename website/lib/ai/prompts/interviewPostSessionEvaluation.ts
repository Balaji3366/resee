import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface InterviewPostSessionEvaluationParams {
  roleTitle: string;
  qaPairs: { question: string; answer: string }[];
}

export interface InterviewPostSessionEvaluationResult {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  overallRecommendations: string;
}

/**
 * Synthesizes across every question in a completed attempt in one call —
 * distinct from buildInterviewFeedbackPrompt (interviewFeedback.ts),
 * which scores a single question/answer pair for the opt-in Deep AI
 * Analysis drill-down. This is the automatic, whole-session evaluation
 * (Decision 5): one call, one credit, per completed interview.
 */
export function buildInterviewPostSessionEvaluationPrompt(
  context: UserContext,
  params: InterviewPostSessionEvaluationParams
): PromptResult {
  const system = `You evaluate a candidate's complete mock interview session across all of their answers together.
Base every score and observation only on what the candidate actually wrote — an unanswered
question is a gap to note, never a reason to invent content they didn't provide.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "overallScore": number (0-100),
  "communicationScore": number (0-100, clarity and structure of the answers),
  "technicalScore": number (0-100, accuracy and depth of technical content where relevant),
  "confidenceScore": number (0-100, decisiveness and command of the material conveyed in writing),
  "strengths": string[] (2-4 items),
  "weaknesses": string[] (2-4 items),
  "improvementSuggestions": string[] (2-4 concrete, actionable items),
  "overallRecommendations": string (under 60 words, direct and encouraging)
}`;

  const user = `Candidate context:
${formatContextBlock({ roleTitle: params.roleTitle, skillLevel: context.skillLevel })}

Interview questions and the candidate's answers:
${params.qaPairs
  .map((qa, i) => `${i + 1}. Q: ${qa.question}\nA: ${qa.answer || "(no answer given)"}`)
  .join("\n\n")}

Evaluate this complete session and return the JSON described above.`;

  return { system, user };
}
