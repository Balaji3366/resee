import { useEffect, useState } from "react";
import type { InterviewCategory } from "@/types/interview";

export function useInterviewCategories() {
  const [data, setData] = useState<InterviewCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interviews/categories");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load interview categories.");
        }

        setData(json.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interview categories.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
