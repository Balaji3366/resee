import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface JobMatchParams {
  jobTitle: string;
  jobDescription: string;
  jobSkills: string[];
}

export interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
}

export function buildJobMatchPrompt(context: UserContext, params: JobMatchParams): PromptResult {
  const system = `You assess how well a candidate's background matches a job posting.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "matchScore": number (0-100),
  "matchingSkills": string[],
  "missingSkills": string[],
  "summary": string (under 40 words)
}`;

  const user = `Candidate's skills and background:
${formatContextBlock({
  skills: context.skills.map((s) => s.name),
  resumeSkills: context.resume?.skills,
  targetCareer: context.targetCareer,
  skillLevel: context.skillLevel,
})}

Job posting:
Title: ${params.jobTitle}
Required skills: ${params.jobSkills.join(", ")}
Description: ${params.jobDescription}

Assess the match and return the JSON described above.`;

  return { system, user };
}
