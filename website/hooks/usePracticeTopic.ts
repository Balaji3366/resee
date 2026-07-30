import { useCallback, useEffect, useState } from "react";
import type { PracticeTopicSummary } from "@/types/practice";

export function usePracticeTopic(slug: string) {
  const [data, setData] = useState<PracticeTopicSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/practice/topics/${slug}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load topic.");
      }

      setData(json.topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topic.");
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
