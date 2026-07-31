import { useEffect, useState } from "react";
import type { JobSummary } from "@/types/jobs";

export type RecommendationBasis = "preferences" | "target_career" | "recent";

export function useRecommendedJobs() {
  const [data, setData] = useState<JobSummary[] | null>(null);
  const [basis, setBasis] = useState<RecommendationBasis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/jobs/recommended");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load recommended jobs.");
        }

        setData(json.jobs);
        setBasis(json.basis);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recommended jobs.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, basis, loading, error };
}
