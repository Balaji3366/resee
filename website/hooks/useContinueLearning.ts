import { useEffect, useState } from "react";
import { dedupedFetchJson } from "@/lib/dedupedFetch";
import type { ContinueLearningData } from "@/types/learning";

export function useContinueLearning() {
  const [data, setData] = useState<ContinueLearningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { ok, json } = await dedupedFetchJson<{
          success: boolean;
          message?: string;
          data: ContinueLearningData;
        }>("/api/learning/continue");

        if (!ok || !json?.success) {
          throw new Error(json?.message || "Failed to load continue-learning data.");
        }

        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load continue-learning data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
