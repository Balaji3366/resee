import { useEffect, useState } from "react";
import type { TimelineEntry } from "@/types/progress";

export function useProgressTimeline() {
  const [data, setData] = useState<TimelineEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress/timeline");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load timeline.");
        }

        setData(json.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load timeline.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
