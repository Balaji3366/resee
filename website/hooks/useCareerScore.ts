import { useEffect, useState } from "react";
import type {
  OverallStatus,
  SubMetricKey,
  SubMetric,
} from "@/lib/careerScore";

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
        const res = await fetch("/api/career-score");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load career score.");
        }

        setData({
          overall: json.overall,
          overallStatus: json.overallStatus,
          subMetrics: json.subMetrics,
          history: json.history,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load career score."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
