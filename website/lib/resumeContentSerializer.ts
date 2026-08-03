import type { ResumeContent } from "@/types/resume-builder";

/**
 * Bridges Resume Studio's structured ResumeContent into the flat
 * `resumeText` string the existing AI prompt builders
 * (lib/ai/prompts/resumeAnalysis.ts, resumeRewrite.ts) already expect —
 * those builders were written against a plain-text resume (matching the
 * legacy PDF-upload analyzer's input) and are reused as-is rather than
 * rewritten to accept structured content directly.
 */
export function resumeContentToText(content: ResumeContent): string {
  const { personalInfo, education, experience, projects, skills, certifications } = content;
  const lines: string[] = [];

  lines.push(personalInfo.fullName || "Candidate");
  const contactLine = [personalInfo.email, personalInfo.phone, personalInfo.address]
    .filter(Boolean)
    .join(" | ");
  if (contactLine) lines.push(contactLine);
  if (personalInfo.summary) {
    lines.push("", "SUMMARY", personalInfo.summary);
  }

  if (experience.length > 0) {
    lines.push("", "EXPERIENCE");
    for (const item of experience) {
      lines.push(
        `${item.role}, ${item.company} (${item.startDate} - ${item.current ? "Present" : item.endDate})`
      );
      for (const bullet of item.bullets) lines.push(`- ${bullet}`);
    }
  }

  if (education.length > 0) {
    lines.push("", "EDUCATION");
    for (const item of education) {
      lines.push(
        `${item.degree}${item.field ? `, ${item.field}` : ""} — ${item.institution} (${item.startDate} - ${item.endDate})`
      );
    }
  }

  if (projects.length > 0) {
    lines.push("", "PROJECTS");
    for (const item of projects) {
      lines.push(
        `${item.name}: ${item.description}${item.techStack.length ? ` [${item.techStack.join(", ")}]` : ""}`
      );
    }
  }

  if (skills.length > 0) {
    lines.push("", "SKILLS", skills.join(", "));
  }

  if (certifications.length > 0) {
    lines.push("", "CERTIFICATIONS");
    for (const item of certifications) {
      lines.push(`${item.name} — ${item.issuer}, ${item.date}`);
    }
  }

  return lines.join("\n");
}
