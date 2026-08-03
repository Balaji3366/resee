import jsPDF from "jspdf";
import { PdfCursor } from "./pdfCursor";
import type { ResumeAnalysisResult } from "@/lib/ai/prompts/resumeAnalysis";

/**
 * Exportable AI Analysis Report — reuses the exact same jsPDF + PdfCursor
 * mechanism already established for resume exports (modernTemplatePdf.ts/
 * atsFriendlyTemplatePdf.ts) rather than introducing a second PDF
 * pipeline.
 */
export function downloadResumeAnalysisReportPdf(result: ResumeAnalysisResult, resumeTitle: string) {
  const pdf = new jsPDF();
  const cursor = new PdfCursor(pdf);

  cursor.text("AI Resume Analysis Report", { size: 18, bold: true, lineHeight: 8 });
  cursor.text(resumeTitle, { size: 11 });
  cursor.text("AI-generated — review before relying on this for important decisions.", { size: 8 });
  cursor.divider();

  cursor.text(`ATS Score: ${result.atsScore} / 100`, { size: 13, bold: true, lineHeight: 7 });
  cursor.text(result.summary, { size: 10 });
  cursor.space(3);

  cursor.text("SECTION SCORES", { size: 11, bold: true, lineHeight: 7 });
  result.sectionScores.forEach((section) => {
    cursor.twoColumn(section.section, `${section.score} / 100`, { size: 10 });
  });
  cursor.space(3);

  cursor.text("STRENGTHS", { size: 11, bold: true, lineHeight: 7 });
  result.strengths.forEach((s) => cursor.text(`•  ${s}`, { size: 10 }));
  cursor.space(3);

  cursor.text("WEAKNESSES", { size: 11, bold: true, lineHeight: 7 });
  result.weaknesses.forEach((s) => cursor.text(`•  ${s}`, { size: 10 }));
  cursor.space(3);

  cursor.text("MATCHED KEYWORDS", { size: 11, bold: true, lineHeight: 7 });
  cursor.text(result.matchedKeywords.join(", ") || "None detected", { size: 10 });
  cursor.space(3);

  cursor.text("MISSING KEYWORDS", { size: 11, bold: true, lineHeight: 7 });
  cursor.text(result.missingKeywords.join(", ") || "None", { size: 10 });
  cursor.space(3);

  cursor.text("SUGGESTIONS", { size: 11, bold: true, lineHeight: 7 });
  result.suggestions.forEach((s) => cursor.text(`•  ${s}`, { size: 10 }));

  pdf.save(`${resumeTitle} - AI Analysis Report.pdf`);
}
