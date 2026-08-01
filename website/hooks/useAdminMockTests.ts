import { useCallback, useEffect, useState } from "react";
import type { AdminMockTestSummary } from "@/types/admin";

export function useAdminMockTests() {
  const [data, setData] = useState<AdminMockTestSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/practice/mock-tests");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load mock tests.");
      }

      setData(json.tests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mock tests.");
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
