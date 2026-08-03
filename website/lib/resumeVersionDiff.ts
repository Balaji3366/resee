import type { ResumeContent } from "@/types/resume-builder";

export interface ResumeVersionDiff {
  summaryChanged: boolean;
  skillsAdded: string[];
  skillsRemoved: string[];
  experienceBulletsChanged: { company: string; role: string }[];
  educationCountDelta: number;
  projectsCountDelta: number;
  certificationsCountDelta: number;
  hasChanges: boolean;
}

/**
 * Deterministic, zero-cost structural diff between two resume versions —
 * always computed first and shown for free, matching the same
 * rule-based-baseline-plus-optional-AI-layer pattern already approved for
 * Learning/Daily Recommendations. The optional AI narrative
 * (resume_version_comparison) is layered on top of this, not a
 * replacement for it.
 */
export function diffResumeVersions(before: ResumeContent, after: ResumeContent): ResumeVersionDiff {
  const summaryChanged = (before.personalInfo.summary ?? "") !== (after.personalInfo.summary ?? "");

  const beforeSkills = new Set(before.skills);
  const afterSkills = new Set(after.skills);
  const skillsAdded = after.skills.filter((s) => !beforeSkills.has(s));
  const skillsRemoved = before.skills.filter((s) => !afterSkills.has(s));

  const experienceBulletsChanged = after.experience
    .map((item, index) => {
      const prior = before.experience[index];
      if (!prior) return null;
      const changed = JSON.stringify(prior.bullets) !== JSON.stringify(item.bullets);
      return changed ? { company: item.company, role: item.role } : null;
    })
    .filter((v): v is { company: string; role: string } => v !== null);

  const educationCountDelta = after.education.length - before.education.length;
  const projectsCountDelta = after.projects.length - before.projects.length;
  const certificationsCountDelta = after.certifications.length - before.certifications.length;

  const hasChanges =
    summaryChanged ||
    skillsAdded.length > 0 ||
    skillsRemoved.length > 0 ||
    experienceBulletsChanged.length > 0 ||
    educationCountDelta !== 0 ||
    projectsCountDelta !== 0 ||
    certificationsCountDelta !== 0;

  return {
    summaryChanged,
    skillsAdded,
    skillsRemoved,
    experienceBulletsChanged,
    educationCountDelta,
    projectsCountDelta,
    certificationsCountDelta,
    hasChanges,
  };
}
