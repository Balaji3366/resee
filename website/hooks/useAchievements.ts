import { useEffect, useState } from "react";
import type { AchievementStatus } from "@/types/progress";

export function useAchievements() {
  const [data, setData] = useState<AchievementStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress/achievements");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load achievements.");
        }

        setData(json.achievements);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load achievements.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
