import type { ResumeUserType } from "@/types/resume-builder";

/**
 * The single seam where template choice happens — never exposed to the
 * user. A future smarter (e.g. AI-driven) selector replaces this rule
 * without touching any call site.
 */
export function selectTemplate(userType: ResumeUserType): "ats-friendly" | "modern" {
  return userType === "fresher" ? "ats-friendly" : "modern";
}
