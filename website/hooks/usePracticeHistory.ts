import { useEffect, useState } from "react";
import type { PracticeHistoryEntry } from "@/types/practice";

export function usePracticeHistory() {
  const [data, setData] = useState<PracticeHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/practice/history");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load practice history.");
        }

        setData(json.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load practice history.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
