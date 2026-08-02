"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { featureFlags as staticDefaults } from "@/lib/config/featureFlags.config";
import type { FeatureFlag } from "@/lib/config/featureFlags.config";

type FeatureFlagsValue = typeof staticDefaults;

const FeatureFlagsContext = createContext<FeatureFlagsValue>(staticDefaults);

/**
 * Now backed by the `feature_flags` table (supabase/migrations/
 * 0018_ai_pipeline_hardening.sql) instead of purely the static config —
 * this is the dynamic-toggle seam this provider was originally built to
 * leave open. Consumers still read via useFeatureFlags()/useFeatureFlag()
 * exactly as before; behavior is unchanged for the common case (every
 * flag defaults to false) since the provider renders with the static
 * defaults first, then swaps in the live DB values once fetched — no
 * flash of incorrect state, and it degrades to the static defaults on
 * any fetch error rather than breaking.
 */
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlagsValue>(staticDefaults);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/feature-flags");
        const json = await res.json();

        if (!cancelled && res.ok && json.success) {
          setFlags(json.flags);
        }
      } catch {
        // Fetch failure keeps the static defaults already rendered —
        // never leaves consumers without a value.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <FeatureFlagsContext.Provider value={flags}>{children}</FeatureFlagsContext.Provider>;
}

export function useFeatureFlags(): FeatureFlagsValue {
  return useContext(FeatureFlagsContext);
}

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return useContext(FeatureFlagsContext)[flag];
}
