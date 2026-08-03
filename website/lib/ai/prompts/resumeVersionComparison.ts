import { formatContextBlock } from "../promptBuilder";
import type { PromptResult } from "../promptBuilder";
import type { UserContext } from "@/types/ai";

export interface ResumeVersionComparisonParams {
  beforeText: string;
  afterText: string;
}

export interface ResumeVersionComparisonResult {
  summary: string;
  improvements: string[];
  regressions: string[];
}

/**
 * Narrative layer on top of the deterministic, non-AI structural diff
 * (lib/resumeVersionDiff.ts) — that diff always runs first and for free;
 * this prompt only adds an AI-written "what actually got better/worse"
 * summary on top of it, mirroring the rule-based-baseline-plus-optional-
 * AI-layer pattern already used for Learning/Daily Recommendations.
 */
export function buildResumeVersionComparisonPrompt(
  context: UserContext,
  params: ResumeVersionComparisonParams
): PromptResult {
  const system = `You compare two versions of the same candidate's resume and summarise what changed.
Base your answer only on the two resume texts provided — never invent a change that isn't
actually present in the difference between them.
Return ONLY valid JSON matching this exact shape, no markdown fences, no extra text:
{
  "summary": string (under 50 words, plain-language summary of the overall change),
  "improvements": string[] (0-5 items — concrete ways the newer version is stronger),
  "regressions": string[] (0-5 items — concrete ways the newer version is weaker or removed useful content)
}`;

  const user = `Candidate's target career context:
${formatContextBlock({ targetCareer: context.targetCareer, skillLevel: context.skillLevel })}

Earlier resume version:
"""
${params.beforeText}
"""

Newer resume version:
"""
${params.afterText}
"""

Compare these two versions and return the JSON described above.`;

  return { system, user };
}
