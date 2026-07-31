export type ResumeUserType = "fresher" | "experienced";

export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  address?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeContent {
  userType: ResumeUserType;
  personalInfo: ResumePersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: string[];
  certifications: CertificationItem[];
}

export interface ResumeSummary {
  id: string;
  title: string;
  templateSlug: string;
  updatedAt: string;
  createdAt: string;
}

export interface ResumeDetail extends ResumeSummary {
  content: ResumeContent;
}

export interface ResumeVersionSummary {
  id: string;
  versionNumber: number;
  createdAt: string;
}

export function emptyResumeContent(userType: ResumeUserType = "fresher"): ResumeContent {
  return {
    userType,
    personalInfo: { fullName: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
  };
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;
}

export function createEmptyEducationItem(): EducationItem {
  return { id: genId(), institution: "", degree: "", field: "", startDate: "", endDate: "" };
}

export function createEmptyExperienceItem(): ExperienceItem {
  return { id: genId(), company: "", role: "", startDate: "", endDate: "", current: false, bullets: [] };
}

export function createEmptyProjectItem(): ProjectItem {
  return { id: genId(), name: "", description: "", techStack: [] };
}

export function createEmptyCertificationItem(): CertificationItem {
  return { id: genId(), name: "", issuer: "", date: "" };
}
