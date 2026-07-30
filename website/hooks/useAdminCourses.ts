import { useCallback, useEffect, useState } from "react";
import type { AdminCourseSummary } from "@/types/admin";

export function useAdminCourses() {
  const [data, setData] = useState<AdminCourseSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/courses");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load learning paths.");
      }

      setData(json.courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load learning paths.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
