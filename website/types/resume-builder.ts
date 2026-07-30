export type ResumeSectionType =
  | "summary"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "certifications"
  | "achievements"
  | "languages"
  | "interests"
  | "references";

export const RESUME_SECTION_LABELS: Record<ResumeSectionType, string> = {
  summary: "Professional Summary",
  education: "Education",
  experience: "Experience",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
  languages: "Languages",
  interests: "Interests",
  references: "References",
};

export interface ResumeLink {
  label: string;
  url: string;
}

export interface ResumePersonalInfo {
  fullName: string;
  title?: string;
  email: string;
  phone: string;
  location: string;
  links: ResumeLink[];
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

export interface LanguageItem {
  name: string;
  level: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  relation: string;
  contact: string;
}

export type ResumeSection =
  | { id: string; type: "summary"; order: number; data: { text: string } }
  | { id: string; type: "education"; order: number; data: { items: EducationItem[] } }
  | { id: string; type: "experience"; order: number; data: { items: ExperienceItem[] } }
  | { id: string; type: "skills"; order: number; data: { items: string[] } }
  | { id: string; type: "projects"; order: number; data: { items: ProjectItem[] } }
  | { id: string; type: "certifications"; order: number; data: { items: CertificationItem[] } }
  | { id: string; type: "achievements"; order: number; data: { items: string[] } }
  | { id: string; type: "languages"; order: number; data: { items: LanguageItem[] } }
  | { id: string; type: "interests"; order: number; data: { items: string[] } }
  | { id: string; type: "references"; order: number; data: { items: ReferenceItem[] } };

export interface ResumeContent {
  personalInfo: ResumePersonalInfo;
  sections: ResumeSection[];
}

export type ResumeStatus = "active" | "archived";

export interface ResumeTemplateSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  isAvailable: boolean;
}

export interface ResumeSummary {
  id: string;
  title: string;
  templateSlug: string;
  status: ResumeStatus;
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

export function emptyResumeContent(): ResumeContent {
  return {
    personalInfo: { fullName: "", email: "", phone: "", location: "", links: [] },
    sections: [],
  };
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;
}

export function createEmptySection(type: ResumeSectionType, order: number): ResumeSection {
  const id = genId();

  switch (type) {
    case "summary":
      return { id, type, order, data: { text: "" } };
    case "education":
      return { id, type, order, data: { items: [] } };
    case "experience":
      return { id, type, order, data: { items: [] } };
    case "skills":
      return { id, type, order, data: { items: [] } };
    case "projects":
      return { id, type, order, data: { items: [] } };
    case "certifications":
      return { id, type, order, data: { items: [] } };
    case "achievements":
      return { id, type, order, data: { items: [] } };
    case "languages":
      return { id, type, order, data: { items: [] } };
    case "interests":
      return { id, type, order, data: { items: [] } };
    case "references":
      return { id, type, order, data: { items: [] } };
  }
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

export function createEmptyReferenceItem(): ReferenceItem {
  return { id: genId(), name: "", relation: "", contact: "" };
}

export function createEmptyLanguageItem(): LanguageItem {
  return { name: "", level: "" };
}
