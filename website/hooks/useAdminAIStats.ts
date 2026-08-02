import { useCallback, useEffect, useState } from "react";
import type { AdminAIStats } from "@/types/admin";

export function useAdminAIStats() {
  const [data, setData] = useState<AdminAIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/ai/stats");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load AI stats.");
      }

      setData(json.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI stats.");
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
