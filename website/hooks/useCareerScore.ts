import { useEffect, useState } from "react";
import { dedupedFetchJson } from "@/lib/dedupedFetch";
import type { OverallStatus, SubMetricKey, SubMetric } from "@/lib/careerScore";

export interface CareerScoreHistoryPoint {
  date: string;
  overall: number;
}

export interface CareerScoreData {
  overall: number | null;
  overallStatus: OverallStatus;
  subMetrics: Record<SubMetricKey, SubMetric>;
  history: CareerScoreHistoryPoint[];
}

export function useCareerScore() {
  const [data, setData] = useState<CareerScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { ok, json } = await dedupedFetchJson<{
          success: boolean;
          message?: string;
          overall: number | null;
          overallStatus: OverallStatus;
          subMetrics: Record<SubMetricKey, SubMetric>;
          history: CareerScoreHistoryPoint[];
        }>("/api/career-score");

        if (!ok || !json?.success) {
          throw new Error(json?.message || "Failed to load career score.");
        }

        setData({
          overall: json.overall,
          overallStatus: json.overallStatus,
          subMetrics: json.subMetrics,
          history: json.history,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load career score.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
