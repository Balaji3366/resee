import { useEffect, useState } from "react";
import type { ProgressSkillsData } from "@/types/progress";

export function useSkillProgress() {
  const [data, setData] = useState<ProgressSkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/progress/skills");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load skill progress.");
        }

        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load skill progress.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
