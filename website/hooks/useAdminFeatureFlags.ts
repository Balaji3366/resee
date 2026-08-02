import { useCallback, useEffect, useState } from "react";
import type { FeatureFlagRow } from "@/lib/ai/featureFlags";

export function useAdminFeatureFlags() {
  const [data, setData] = useState<FeatureFlagRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/ai/feature-flags");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load feature flags.");
      }

      setData(json.flags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feature flags.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function toggle(slug: string, enabled: boolean) {
    await fetch("/api/admin/ai/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, enabled }),
    });
    await load();
  }

  return { data, loading, error, refetch: load, toggle };
}
