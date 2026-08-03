import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface ResumeAnalysisParams {
  resumeText: string;
}

export interface ResumeSectionScore {
  section: string;
  score: number;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sectionScores: ResumeSectionScore[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

const SECTION_NAMES = [
  "Personal Info",
  "Experience",
  "Education",
  "Skills",
  "Projects",
  "Certifications",
];

export function buildResumeAnalysisPrompt(
  context: UserContext,
  params: ResumeAnalysisParams
): PromptResult {
  const system = `You analyse resumes for ATS (Applicant Tracking System) compatibility and quality.
Only score sections that are actually present in the resume text — never invent content for a
section that is missing or empty; give a missing section a low score reflecting its absence,
not a fabricated description of it.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "atsScore": number (0-100),
  "summary": string (under 40 words),
  "strengths": string[] (exactly 4 items),
  "weaknesses": string[] (exactly 4 items),
  "sectionScores": [{ "section": string, "score": number (0-100) }] (exactly one entry per section: ${SECTION_NAMES.join(", ")}),
  "matchedKeywords": string[] (up to 6 relevant keywords/skills already present that strengthen ATS matching),
  "missingKeywords": string[] (exactly 4 items — relevant keywords/skills the resume lacks for the candidate's target career),
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
