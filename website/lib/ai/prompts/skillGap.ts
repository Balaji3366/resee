import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface SkillGapParams {
  targetRole: string;
}

export interface SkillGapResult {
  hasSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export function buildSkillGapPrompt(context: UserContext, params: SkillGapParams): PromptResult {
  const system = `You identify the gap between a candidate's current skills and what a target role typically requires.
Base "hasSkills" only on skills actually listed in the candidate's context below — never invent a
skill they haven't demonstrated, and never fabricate a missing skill that isn't genuinely relevant
to the target role.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "hasSkills": string[],
  "missingSkills": string[],
  "recommendations": string[] (3-5 concrete, actionable items)
}`;

  const user = `Candidate's current skills and progress:
${formatContextBlock({
  skills: context.skills.map((s) => `${s.name} (${s.percent}%)`),
  weakTopics: context.practice.weakTopics,
  strongTopics: context.practice.strongTopics,
  skillLevel: context.skillLevel,
})}

Target role: ${params.targetRole}

Identify the skill gap and return the JSON described above.`;

  return { system, user };
}
