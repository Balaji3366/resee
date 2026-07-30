import { useCallback, useEffect, useState } from "react";
import type { ResumeStatus, ResumeSummary } from "@/types/resume-builder";

export function useResumes(status: ResumeStatus = "active") {
  const [data, setData] = useState<ResumeSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/resumes?status=${status}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load resumes.");
      }

      setData(json.resumes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
