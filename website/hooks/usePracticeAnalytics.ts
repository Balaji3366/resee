import { useEffect, useState } from "react";
import type { PracticeAnalyticsData } from "@/types/practice";

export function usePracticeAnalytics() {
  const [data, setData] = useState<PracticeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/practice/analytics");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load analytics.");
        }

        setData(json.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
