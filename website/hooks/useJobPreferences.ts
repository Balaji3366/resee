import { useCallback, useEffect, useState } from "react";
import type { JobPreferences } from "@/types/jobs";

export function useJobPreferences() {
  const [data, setData] = useState<JobPreferences | null>(null);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/jobs/preferences");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load job preferences.");
      }

      setData(json.preferences);
      setHasPreferences(json.hasPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job preferences.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function update(preferences: JobPreferences) {
    await fetch("/api/jobs/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    await load();
  }

  return { data, hasPreferences, loading, error, refetch: load, update };
}
