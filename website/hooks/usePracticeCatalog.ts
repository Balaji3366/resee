import { useCallback, useEffect, useState } from "react";
import type { PracticeCategory, PracticeTopicSummary } from "@/types/practice";

interface PracticeCatalog {
  categories: PracticeCategory[];
  topics: PracticeTopicSummary[];
}

export function usePracticeCatalog() {
  const [data, setData] = useState<PracticeCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/practice/topics");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load practice catalog.");
      }

      setData({ categories: json.categories, topics: json.topics });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load practice catalog.");
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
