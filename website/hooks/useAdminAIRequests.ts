import { useCallback, useEffect, useState } from "react";
import type { AdminAIRequestLogEntry } from "@/types/admin";

export function useAdminAIRequests(page: number, pageSize = 25) {
  const [data, setData] = useState<AdminAIRequestLogEntry[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/ai/requests?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load AI request logs.");
      }

      setData(json.requests);
      setTotalPages(json.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI request logs.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, totalPages, loading, error, refetch: load };
}
