import { useEffect, useState } from "react";
import type { AdminDashboardStats } from "@/types/admin";

export function useAdminDashboardStats() {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats/dashboard");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load dashboard stats.");
        }

        setData(json.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
