"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { featureFlags as staticDefaults } from "@/lib/config/featureFlags.config";
import type { FeatureFlag } from "@/lib/config/featureFlags.config";
import { useAuthContext } from "@/components/providers/AuthProvider";

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
 *
 * Gated on auth readiness (A-L2 QA fix): /api/feature-flags requires a
 * session, but this provider is mounted app-wide (app/layout.tsx), above
 * both authenticated and public pages. Fetching unconditionally on mount
 * used to race the browser Supabase client's own async session
 * hydration — firing before the auth cookie was attached, drawing a
 * spurious 401 that a moment later "fixed itself" once the session was
 * ready. Waiting for AuthProvider's `loading` to resolve removes the
 * race outright; skipping the fetch entirely while unauthenticated (and
 * resetting to the static defaults, so a just-logged-out session doesn't
 * keep the previous user's flags) also removes the *guaranteed* 401 this
 * provider used to always draw on every public page.
 */
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  // Only ever holds a fetched, authenticated result — never the static
  // defaults, so "what to render" can be a plain derived expression
  // below instead of a synchronous setState-in-effect reset whenever
  // auth becomes unavailable.
  const [fetchedFlags, setFetchedFlags] = useState<FeatureFlagsValue | null>(null);

  useEffect(() => {
    // Auth state not resolved yet — wait rather than guess. Also skip
    // entirely while unauthenticated: the endpoint requires a session,
    // so there's nothing to fetch (and nothing to 401 on).
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/feature-flags");
        const json = await res.json();

        if (!cancelled && res.ok && json.success) {
          setFetchedFlags(json.flags);
        }
      } catch {
        // Fetch failure keeps the static defaults already rendered —
        // never leaves consumers without a value.
      }
    }

    load();
    return () => {
      cancelled = true;
      // Drop the previous session's fetched flags the moment auth
      // readiness changes (e.g. logout) — the derived value below falls
      // straight back to the static defaults instead of briefly serving
      // a signed-out (or different) user someone else's flags.
      setFetchedFlags(null);
    };
  }, [authLoading, isAuthenticated]);

  const flags = isAuthenticated && fetchedFlags ? fetchedFlags : staticDefaults;

  return <FeatureFlagsContext.Provider value={flags}>{children}</FeatureFlagsContext.Provider>;
}

export function useFeatureFlags(): FeatureFlagsValue {
  return useContext(FeatureFlagsContext);
}

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return useContext(FeatureFlagsContext)[flag];
}
