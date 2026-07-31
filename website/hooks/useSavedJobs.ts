import { useCallback, useEffect, useState } from "react";
import type { SavedJob } from "@/types/jobs";

export function useSavedJobs() {
  const [data, setData] = useState<SavedJob[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/jobs/saved");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load saved jobs.");
      }

      setData(json.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function save(jobId: string) {
    await fetch("/api/jobs/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    await load();
  }

  async function unsave(jobId: string) {
    await fetch(`/api/jobs/saved/${jobId}`, { method: "DELETE" });
    await load();
  }

  return { data, loading, error, refetch: load, save, unsave };
}
