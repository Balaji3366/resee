import { useCallback, useEffect, useState } from "react";
import type { AdminJobDetail } from "@/types/admin";

export function useAdminJobDetail(jobId: string) {
  const [data, setData] = useState<AdminJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/jobs/${jobId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load job.");
      }

      setData(json.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
