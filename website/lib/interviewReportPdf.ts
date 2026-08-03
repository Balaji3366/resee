import jsPDF from "jspdf";
import { PdfCursor } from "@/lib/resume-pdf/pdfCursor";
import type { InterviewPostSessionEvaluationResult } from "@/lib/ai/prompts/interviewPostSessionEvaluation";

/**
 * Exportable AI Interview Report — reuses the exact same jsPDF +
 * PdfCursor mechanism already established for resume exports
 * (lib/resume-pdf/analysisReportPdf.ts) rather than introducing a
 * second PDF pipeline.
 */
export function downloadInterviewReportPdf(
  evaluation: InterviewPostSessionEvaluationResult,
  interviewTitle: string
) {
  const pdf = new jsPDF();
  const cursor = new PdfCursor(pdf);

  cursor.text("AI Interview Evaluation Report", { size: 18, bold: true, lineHeight: 8 });
  cursor.text(interviewTitle, { size: 11 });
  cursor.text("AI-generated — review before relying on this for real decisions.", { size: 8 });
  cursor.divider();

  cursor.text(`Overall Score: ${evaluation.overallScore} / 100`, {
    size: 13,
    bold: true,
    lineHeight: 7,
  });
  cursor.space(2);

  cursor.twoColumn("Communication", `${evaluation.communicationScore} / 100`, { size: 10 });
  cursor.twoColumn("Technical", `${evaluation.technicalScore} / 100`, { size: 10 });
  cursor.twoColumn("Confidence", `${evaluation.confidenceScore} / 100`, { size: 10 });
  cursor.space(3);

  cursor.text("STRENGTHS", { size: 11, bold: true, lineHeight: 7 });
  evaluation.strengths.forEach((s) => cursor.text(`•  ${s}`, { size: 10 }));
  cursor.space(3);

  cursor.text("WEAKNESSES", { size: 11, bold: true, lineHeight: 7 });
  evaluation.weaknesses.forEach((s) => cursor.text(`•  ${s}`, { size: 10 }));
  cursor.space(3);

  cursor.text("IMPROVEMENT SUGGESTIONS", { size: 11, bold: true, lineHeight: 7 });
  evaluation.improvementSuggestions.forEach((s) => cursor.text(`•  ${s}`, { size: 10 }));
  cursor.space(3);

  cursor.text("OVERALL RECOMMENDATIONS", { size: 11, bold: true, lineHeight: 7 });
  cursor.text(evaluation.overallRecommendations, { size: 10 });

  pdf.save(`${interviewTitle} - AI Interview Report.pdf`);
}
