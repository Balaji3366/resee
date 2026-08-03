import { useCallback, useEffect, useState } from "react";
import type { ResumeAnalysisResult } from "@/lib/ai/prompts/resumeAnalysis";
import type { ResumeRewriteResult } from "@/lib/ai/prompts/resumeRewrite";
import type { ResumeBulletImprovementResult } from "@/lib/ai/prompts/resumeBulletImprovement";
import type { ResumeVersionComparisonResult } from "@/lib/ai/prompts/resumeVersionComparison";

export type ResumeAnalysisHistoryEntry = {
  id: string;
  feature:
    | "resume_analysis"
    | "resume_rewrite"
    | "resume_bullet_improvement"
    | "resume_version_comparison";
  result:
    | ResumeAnalysisResult
    | ResumeRewriteResult
    | ResumeBulletImprovementResult
    | ResumeVersionComparisonResult;
  createdAt: string;
};

/** Same hand-rolled fetch pattern as useResumes/useResumeVersions —
 *  matches this module's existing hooks rather than introducing a
 *  different data-fetching convention for the one new AI-history hook. */
export function useResumeAnalyses(resumeId: string) {
  const [data, setData] = useState<ResumeAnalysisHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/resumes/${resumeId}/analyses`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load analysis history.");
      }

      setData(json.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis history.");
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
