import { useEffect, useState } from "react";
import type { MilestoneStatus } from "@/types/progress";

export function useMilestones() {
  const [data, setData] = useState<MilestoneStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress/milestones");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load milestones.");
        }

        setData(json.milestones);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load milestones.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
