import type { ResumeContent } from "@/types/resume-builder";

export interface ResumeCompletenessCheck {
  label: string;
  met: boolean;
}

export interface ResumeCompleteness {
  percent: number;
  checks: ResumeCompletenessCheck[];
}

/**
 * A resume completeness score, computed client-side from the same
 * ResumeContent shape the wizard already produces — no new DB column,
 * no server round-trip. Each check is a coarse "is this section
 * meaningfully filled" signal, not a strict validation rule.
 */
export function computeResumeCompleteness(content: ResumeContent): ResumeCompleteness {
  const { personalInfo, education, experience, projects, skills, certifications } = content;

  const checks: ResumeCompletenessCheck[] = [
    {
      label: "Personal info (name, email, phone)",
      met: Boolean(
        personalInfo.fullName.trim() && personalInfo.email.trim() && personalInfo.phone.trim()
      ),
    },
    {
      label: "At least one education entry",
      met: education.some((item) => item.institution.trim() && item.degree.trim()),
    },
    {
      label: "At least one experience or project",
      met:
        experience.some((item) => item.company.trim() && item.role.trim()) ||
        projects.some((item) => item.name.trim() && item.description.trim()),
    },
    {
      label: "At least 3 skills listed",
      met: skills.filter((skill) => skill.trim()).length >= 3,
    },
    {
      label: "At least one certification (optional)",
      met: certifications.some((item) => item.name.trim()),
    },
  ];

  const percent = Math.round((checks.filter((c) => c.met).length / checks.length) * 100);

  return { percent, checks };
}
