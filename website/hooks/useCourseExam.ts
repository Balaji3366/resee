import { useCallback, useEffect, useState } from "react";
import type { CourseExamSummary } from "@/types/learning";

export function useCourseExam(courseSlug: string) {
  const [data, setData] = useState<CourseExamSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/learning/courses/${courseSlug}/exam`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load the final exam.");
      }

      setData(json.exam);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the final exam.");
    } finally {
      setLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
