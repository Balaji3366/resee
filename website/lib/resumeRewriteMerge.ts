import type { ResumeContent } from "@/types/resume-builder";
import type { ResumeRewriteResult } from "@/lib/ai/prompts/resumeRewrite";

/**
 * Merges an AI Resume Rewrite result back into the resume's real
 * ResumeContent — deliberately conservative: only `summary`, `skills`,
 * and each experience entry's `bullets` (matched by array position, same
 * order the prompt was given them in) are ever replaced. Identity fields
 * (name/email/phone) and factual fields (company/role/dates) are never
 * overwritten by AI output, even though the prompt also returns them —
 * those are the user's real data, not something AI should "improve."
 * Experience entries beyond what the AI returned (or that the AI adds
 * extra entries for) are left untouched / ignored, keeping this a pure
 * bullets+summary+skills enhancement, never a structural rewrite.
 */
export function applyResumeRewrite(
  original: ResumeContent,
  rewrite: ResumeRewriteResult
): ResumeContent {
  return {
    ...original,
    personalInfo: {
      ...original.personalInfo,
      summary: rewrite.summary || original.personalInfo.summary,
    },
    skills: rewrite.skills.length > 0 ? rewrite.skills : original.skills,
    experience: original.experience.map((item, index) => {
      const rewritten = rewrite.experience[index];
      if (!rewritten || rewritten.points.length === 0) return item;
      return { ...item, bullets: rewritten.points };
    }),
  };
}

/**
 * Same conservative merge, scoped to a single experience entry — used by
 * the targeted "Improve These Bullets" action (resume_bullet_improvement)
 * rather than a full rewrite.
 */
export function applyBulletImprovement(
  original: ResumeContent,
  experienceId: string,
  improvedBullets: string[]
): ResumeContent {
  if (improvedBullets.length === 0) return original;

  return {
    ...original,
    experience: original.experience.map((item) =>
      item.id === experienceId ? { ...item, bullets: improvedBullets } : item
    ),
  };
}
