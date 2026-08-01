import { useCallback, useEffect, useState } from "react";
import type { AdminPracticeTopicSummary } from "@/types/admin";

export function useAdminPracticeTopics() {
  const [data, setData] = useState<AdminPracticeTopicSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/practice/topics");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load practice topics.");
      }

      setData(json.topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load practice topics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
