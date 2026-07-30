import { useEffect, useState } from "react";
import type { ProgressOverview } from "@/types/progress";

export function useProgressOverview() {
  const [data, setData] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress/overview");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load progress overview.");
        }

        setData(json.overview);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress overview.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
