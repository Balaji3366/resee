import jsPDF from "jspdf";
import type { ResumeContent } from "@/types/resume-builder";
import { PdfCursor } from "./pdfCursor";

export function downloadAtsFriendlyTemplatePdf(content: ResumeContent, fileName: string) {
  const pdf = new jsPDF();
  const cursor = new PdfCursor(pdf);
  const { personalInfo, education, experience, projects, skills, certifications } = content;

  cursor.text(personalInfo.fullName || "Your Name", { size: 16, bold: true, lineHeight: 7 });

  const contactLine = [personalInfo.email, personalInfo.phone, personalInfo.address]
    .filter(Boolean)
    .join(" | ");
  if (contactLine) cursor.text(contactLine, { size: 10 });

  const links = [
    personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : null,
    personalInfo.github ? `GitHub: ${personalInfo.github}` : null,
    personalInfo.portfolio ? `Portfolio: ${personalInfo.portfolio}` : null,
  ].filter((l): l is string => l !== null);
  if (links.length > 0) cursor.text(links.join(" | "), { size: 10 });

  cursor.space(5);

  if (education.length > 0) {
    cursor.text("EDUCATION", { size: 11, bold: true, lineHeight: 6 });
    education.forEach((item) => {
      cursor.text(`${item.degree}${item.field ? `, ${item.field}` : ""}`, { bold: true, size: 10 });
      cursor.text(`${item.institution} | ${item.startDate} - ${item.endDate}`, { size: 9 });
      if (item.description) cursor.text(item.description, { size: 10 });
      cursor.space(2);
    });
    cursor.space(3);
  }

  if (experience.length > 0) {
    cursor.text("EXPERIENCE", { size: 11, bold: true, lineHeight: 6 });
    experience.forEach((item) => {
      cursor.text(`${item.role}, ${item.company}`, { bold: true, size: 10 });
      cursor.text(`${item.startDate} - ${item.current ? "Present" : item.endDate}`, { size: 9 });
      item.bullets.forEach((bullet) => cursor.text(`- ${bullet}`, { size: 10 }));
      cursor.space(2);
    });
    cursor.space(3);
  }

  if (projects.length > 0) {
    cursor.text("PROJECTS", { size: 11, bold: true, lineHeight: 6 });
    projects.forEach((item) => {
      cursor.text(item.name, { bold: true, size: 10 });
      cursor.text(item.description, { size: 10 });
      if (item.techStack.length > 0) cursor.text(`Tech: ${item.techStack.join(", ")}`, { size: 9 });
      if (item.link) cursor.text(item.link, { size: 9 });
      cursor.space(2);
    });
    cursor.space(3);
  }

  if (skills.length > 0) {
    cursor.text("SKILLS", { size: 11, bold: true, lineHeight: 6 });
    cursor.text(skills.join(", "), { size: 10 });
    cursor.space(3);
  }

  if (certifications.length > 0) {
    cursor.text("CERTIFICATIONS", { size: 11, bold: true, lineHeight: 6 });
    certifications.forEach((item) => {
      cursor.text(`${item.name} - ${item.issuer}, ${item.date}`, { size: 10 });
    });
  }

  pdf.save(fileName);
}
