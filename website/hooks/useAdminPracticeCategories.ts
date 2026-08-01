import { useCallback, useEffect, useState } from "react";
import type { AdminPracticeCategory } from "@/types/admin";

export function useAdminPracticeCategories() {
  const [data, setData] = useState<AdminPracticeCategory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/practice/categories");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load practice categories.");
      }

      setData(json.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load practice categories.");
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
