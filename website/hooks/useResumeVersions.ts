import { useCallback, useEffect, useState } from "react";
import type { ResumeContent, ResumeVersionSummary } from "@/types/resume-builder";

export function useResumeVersions(resumeId: string) {
  const [data, setData] = useState<ResumeVersionSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/resumes/${resumeId}/versions`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load version history.");
      }

      setData(json.versions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load version history.");
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const restore = useCallback(
    async (versionId: string): Promise<ResumeContent> => {
      const res = await fetch(`/api/resumes/${resumeId}/versions/${versionId}/restore`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to restore version.");
      }

      await load();
      return json.content;
    },
    [resumeId, load]
  );

  return { data, loading, error, refetch: load, restore };
}
