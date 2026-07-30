import { useEffect, useState } from "react";
import type { InterviewHistoryEntry } from "@/types/interview";

export function useInterviewHistory() {
  const [data, setData] = useState<InterviewHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interviews/history");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load interview history.");
        }

        setData(json.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interview history.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
