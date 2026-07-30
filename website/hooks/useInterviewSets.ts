import { useCallback, useEffect, useState } from "react";
import type { InterviewSetSummary } from "@/types/interview";

export function useInterviewSets() {
  const [data, setData] = useState<InterviewSetSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/interviews/sets");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load interview sets.");
      }

      setData(json.sets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview sets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
