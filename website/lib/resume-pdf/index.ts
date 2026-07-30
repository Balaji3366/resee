import type { ResumeContent } from "@/types/resume-builder";
import { downloadModernTemplatePdf } from "./modernTemplatePdf";
import { downloadAtsFriendlyTemplatePdf } from "./atsFriendlyTemplatePdf";

const EXPORTERS: Record<string, (content: ResumeContent, fileName: string) => void> = {
  modern: downloadModernTemplatePdf,
  "ats-friendly": downloadAtsFriendlyTemplatePdf,
};

export function downloadResumePdf(templateSlug: string, content: ResumeContent, title: string) {
  const exporter = EXPORTERS[templateSlug] ?? downloadModernTemplatePdf;
  const fileName = `${title.replace(/[^a-z0-9]+/gi, "_")}.pdf`;
  exporter(content, fileName);
}
