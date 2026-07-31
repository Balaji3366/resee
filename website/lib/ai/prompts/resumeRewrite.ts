import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface ResumeRewriteParams {
  resumeText: string;
  targetRole?: string;
}

export interface ResumeRewriteResult {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: { company: string; role: string; location: string; duration: string; points: string[] }[];
  education: { degree: string; college: string; year: string }[];
}

export function buildResumeRewritePrompt(
  context: UserContext,
  params: ResumeRewriteParams
): PromptResult {
  const system = `You rewrite resumes to be clearer, more impactful, and ATS-friendly, without inventing facts not present in the source.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "name": string, "email": string, "phone": string, "summary": string,
  "skills": string[],
  "experience": [{ "company": string, "role": string, "location": string, "duration": string, "points": string[] }],
  "education": [{ "degree": string, "college": string, "year": string }]
}`;

  const user = `Candidate context:
${formatContextBlock({
  targetRole: params.targetRole ?? context.targetCareer,
  skillLevel: context.skillLevel,
})}

Original resume:
"""
${params.resumeText}
"""

Rewrite this resume and return the JSON described above.`;

  return { system, user };
}
