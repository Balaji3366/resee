import { useCallback, useEffect, useState } from "react";
import type { AdminMockTestDetail } from "@/types/admin";

export function useAdminMockTestDetail(testId: string) {
  const [data, setData] = useState<AdminMockTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/practice/mock-tests/${testId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load mock test.");
      }

      setData(json.test);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mock test.");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
