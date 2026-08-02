import { useCallback, useEffect, useState } from "react";
import type { AdminInterviewCategory } from "@/types/admin";

export function useAdminInterviewCategories() {
  const [data, setData] = useState<AdminInterviewCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/interviews/categories");
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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
