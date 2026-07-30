import { useEffect, useState } from "react";
import type { ProgressActivity } from "@/types/progress";

export function useProgressActivity() {
  const [data, setData] = useState<ProgressActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress/activity");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load activity.");
        }

        setData(json.activity);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
