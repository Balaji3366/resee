import { useEffect, useState } from "react";
import type { InterviewPerformanceData } from "@/types/interview";

export function useInterviewPerformance() {
  const [data, setData] = useState<InterviewPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interviews/performance");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load interview performance.");
        }

        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interview performance.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
