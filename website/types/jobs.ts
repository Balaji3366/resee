export type JobWorkMode = "remote" | "hybrid" | "onsite";
export type JobType = "full-time" | "part-time" | "internship" | "contract";
export type JobExperienceLevel = "fresher" | "1-3-years" | "3-5-years" | "5-plus-years";
export type ApplicationStatus =
  "applied" | "interview_scheduled" | "offer_received" | "rejected" | "archived";

export interface JobSummary {
  id: string;
  slug: string;
  title: string;
  company: string;
  roleSlug: string | null;
  location: string;
  workMode: JobWorkMode;
  jobType: JobType;
  experienceLevel: JobExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  postedAt: string;
}

export interface JobDetail extends JobSummary {
  experienceMinYears: number | null;
  experienceMaxYears: number | null;
  description: string;
  responsibilities: string[];
  eligibility: string[];
  applyUrl: string | null;
}

export interface JobFiltersParams {
  q?: string;
  experience?: JobExperienceLevel[];
  workMode?: JobWorkMode[];
  jobType?: JobType[];
  salaryBand?: string[];
}

export interface SavedJob {
  id: string;
  createdAt: string;
  job: JobSummary;
}

export interface JobApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  job: JobSummary;
  resumeId: string | null;
  resumeTitle: string | null;
}

export interface JobPreferences {
  preferredRoles: string[];
  preferredLocations: string[];
  preferredWorkMode: JobWorkMode | null;
}
