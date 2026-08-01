import { useEffect, useState } from "react";
import type { CourseSummary, LearningCategory } from "@/types/learning";

export interface LearningCatalogData {
  categories: LearningCategory[];
  courses: CourseSummary[];
}

export function useLearningCatalog(query = "") {
  const [data, setData] = useState<LearningCatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const url = query
          ? `/api/learning/courses?q=${encodeURIComponent(query)}`
          : "/api/learning/courses";

        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load learning catalog.");
        }

        setData({ categories: json.categories, courses: json.courses });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load learning catalog.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [query]);

  return { data, loading, error };
}
