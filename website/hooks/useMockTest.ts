import { useCallback, useEffect, useState } from "react";
import type { MockTestSummary } from "@/types/practice";

export function useMockTest(slug: string) {
  const [data, setData] = useState<MockTestSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/practice/mock-tests/${slug}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load mock test.");
      }

      setData(json.mockTest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mock test.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
