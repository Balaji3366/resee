import { useCallback, useEffect, useState } from "react";
import type { ResumeDetail } from "@/types/resume-builder";

export function useResumeDetail(resumeId: string) {
  const [data, setData] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/resumes/${resumeId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load resume.");
      }

      setData(json.resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resume.");
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
