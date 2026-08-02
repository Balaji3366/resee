import { useCallback, useEffect, useState } from "react";
import type { AdminInterviewSetDetail } from "@/types/admin";

export function useAdminInterviewSetDetail(setId: string) {
  const [data, setData] = useState<AdminInterviewSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/interviews/sets/${setId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load interview set.");
      }

      setData(json.set);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview set.");
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
