import { useEffect, useState } from "react";
import type { ContinueLearningData } from "@/types/learning";

export function useContinueLearning() {
  const [data, setData] = useState<ContinueLearningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/learning/continue");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load continue-learning data.");
        }

        setData(json.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load continue-learning data."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
