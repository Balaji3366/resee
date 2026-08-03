import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface ResumeBulletImprovementParams {
  company: string;
  role: string;
  bullets: string[];
  targetRole?: string;
}

export interface ResumeBulletImprovementResult {
  improvedBullets: string[];
  achievementSuggestions: string[];
}

/**
 * Targeted counterpart to resume_rewrite — improves the bullet points for
 * ONE experience entry instead of regenerating the whole resume. Shares
 * the same non-fabrication discipline as the full rewrite.
 */
export function buildResumeBulletImprovementPrompt(
  context: UserContext,
  params: ResumeBulletImprovementParams
): PromptResult {
  const system = `You rewrite resume bullet points for a single role to be clearer, more impactful, and ATS-friendly, without inventing facts not present in the source.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "improvedBullets": string[] (same count as the input bullets, rewritten one-for-one, same order),
  "achievementSuggestions": string[] (1-3 items — where a quantifiable metric could strengthen a
    bullet; describe what kind of number would help, never invent a specific number the source
    doesn't support)
}`;

  const user = `Candidate context:
${formatContextBlock({
  targetRole: params.targetRole ?? context.targetCareer,
  skillLevel: context.skillLevel,
})}

Role: ${params.role} at ${params.company}

Original bullet points:
${params.bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Rewrite these bullet points and return the JSON described above.`;

  return { system, user };
}
