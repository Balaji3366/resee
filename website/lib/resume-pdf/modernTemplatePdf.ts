import jsPDF from "jspdf";
import { RESUME_SECTION_LABELS, type ResumeContent } from "@/types/resume-builder";
import { PdfCursor } from "./pdfCursor";

export function downloadModernTemplatePdf(content: ResumeContent, fileName: string) {
  const pdf = new jsPDF();
  const cursor = new PdfCursor(pdf);
  const { personalInfo, sections } = content;

  cursor.text(personalInfo.fullName || "Your Name", { size: 20, bold: true, lineHeight: 8 });
  if (personalInfo.title) cursor.text(personalInfo.title, { size: 12 });

  const contactLine = [personalInfo.email, personalInfo.phone, personalInfo.location]
    .filter(Boolean)
    .join("   |   ");
  if (contactLine) cursor.text(contactLine, { size: 9 });

  if (personalInfo.links.length > 0) {
    cursor.text(personalInfo.links.map((l) => `${l.label}: ${l.url}`).join("   |   "), { size: 9 });
  }

  cursor.divider();

  sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((section) => {
      cursor.text(RESUME_SECTION_LABELS[section.type].toUpperCase(), { size: 11, bold: true, lineHeight: 7 });

      if (section.type === "summary") {
        cursor.text(section.data.text);
      } else if (section.type === "experience") {
        section.data.items.forEach((item) => {
          cursor.twoColumn(item.role, `${item.startDate} - ${item.current ? "Present" : item.endDate}`, {
            bold: true,
          });
          cursor.text(item.company, { size: 10 });
          item.bullets.forEach((bullet) => cursor.text(`•  ${bullet}`, { size: 10 }));
          cursor.space();
        });
      } else if (section.type === "education") {
        section.data.items.forEach((item) => {
          cursor.twoColumn(item.institution, `${item.startDate} - ${item.endDate}`, { bold: true });
          cursor.text(`${item.degree}${item.field ? `, ${item.field}` : ""}`, { size: 10 });
          if (item.description) cursor.text(item.description, { size: 10 });
          cursor.space();
        });
      } else if (section.type === "skills") {
        cursor.text(section.data.items.join(",  "), { size: 10 });
      } else if (section.type === "projects") {
        section.data.items.forEach((item) => {
          cursor.text(item.name, { bold: true });
          cursor.text(item.description, { size: 10 });
          if (item.techStack.length > 0) cursor.text(item.techStack.join(" · "), { size: 9 });
          if (item.link) cursor.text(item.link, { size: 9 });
          cursor.space();
        });
      } else if (section.type === "certifications") {
        section.data.items.forEach((item) => {
          cursor.text(`${item.name} — ${item.issuer}, ${item.date}`, { size: 10 });
        });
      } else if (section.type === "achievements" || section.type === "interests") {
        section.data.items.forEach((item) => cursor.text(`•  ${item}`, { size: 10 }));
      } else if (section.type === "languages") {
        cursor.text(section.data.items.map((l) => `${l.name} (${l.level})`).join(",  "), { size: 10 });
      } else if (section.type === "references") {
        section.data.items.forEach((item) => {
          cursor.text(`${item.name} — ${item.relation}, ${item.contact}`, { size: 10 });
        });
      }

      cursor.space(3);
    });

  pdf.save(fileName);
}
