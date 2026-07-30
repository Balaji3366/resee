import { useEffect, useState } from "react";
import type { ContinueInterviewItem } from "@/types/interview";

export function useContinueInterviews() {
  const [data, setData] = useState<ContinueInterviewItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interviews/continue");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load continue-interview data.");
        }

        setData(json.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load continue-interview data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
