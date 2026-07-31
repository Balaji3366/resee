import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface ResumeAnalysisParams {
  resumeText: string;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export function buildResumeAnalysisPrompt(
  context: UserContext,
  params: ResumeAnalysisParams
): PromptResult {
  const system = `You analyse resumes for ATS (Applicant Tracking System) compatibility and quality.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "atsScore": number (0-100),
  "summary": string (under 40 words),
  "strengths": string[] (exactly 4 items),
  "weaknesses": string[] (exactly 4 items),
  "missingKeywords": string[] (exactly 4 items),
  "suggestions": string[] (exactly 4 items)
}`;

  const user = `Candidate's target career context:
${formatContextBlock({ targetCareer: context.targetCareer, skillLevel: context.skillLevel })}

Resume text:
"""
${params.resumeText}
"""

Analyse this resume and return the JSON described above.`;

  return { system, user };
}
