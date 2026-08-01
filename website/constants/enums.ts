/**
 * Cross-module enums that already exist independently in more than one
 * domain's type file — a single lookup point, not a new source of
 * truth. `types/interview.ts`'s `InterviewExperienceLevel` and
 * `types/jobs.ts`'s `JobExperienceLevel` are word-for-word the same
 * union today; this file names the shared shape without migrating
 * either existing type alias (both stay as-is, matching their own
 * domain's naming convention).
 */
export const EXPERIENCE_LEVELS = ["fresher", "1-3-years", "3-5-years", "5-plus-years"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  fresher: "Fresher",
  "1-3-years": "1-3 years",
  "3-5-years": "3-5 years",
  "5-plus-years": "5+ years",
};

/** Shared by jobs.work_mode and job_preferences.preferred_work_mode. */
export const WORK_MODES = ["remote", "hybrid", "onsite"] as const;
export type WorkMode = (typeof WORK_MODES)[number];
