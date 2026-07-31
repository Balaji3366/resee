import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface InterviewFeedbackParams {
  question: string;
  answer: string;
  roleTitle: string;
}

export interface InterviewFeedbackResult {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswerNotes: string;
}

export function buildInterviewFeedbackPrompt(
  context: UserContext,
  params: InterviewFeedbackParams
): PromptResult {
  const system = `You evaluate a candidate's answer to a single mock interview question.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "score": number (0-100),
  "strengths": string[] (1-3 items),
  "improvements": string[] (1-3 items),
  "modelAnswerNotes": string (under 60 words, guidance not a full script)
}`;

  const user = `Candidate context:
${formatContextBlock({ roleTitle: params.roleTitle, skillLevel: context.skillLevel })}

Interview question: ${params.question}

Candidate's answer:
"""
${params.answer}
"""

Evaluate this answer and return the JSON described above.`;

  return { system, user };
}
