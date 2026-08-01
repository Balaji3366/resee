"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { featureFlags } from "@/lib/config/featureFlags.config";
import type { FeatureFlag } from "@/lib/config/featureFlags.config";

type FeatureFlagsValue = typeof featureFlags;

const FeatureFlagsContext = createContext<FeatureFlagsValue>(featureFlags);

/**
 * Wraps the existing static lib/config/featureFlags.config.ts in
 * Context — consumers read via useFeatureFlags()/useFeatureFlag(flag)
 * instead of importing the config module directly. Sets up the seam
 * for when flags might become dynamic (e.g. fetched per-user) without
 * building that infrastructure now — all 9 flags are still statically
 * false today.
 */
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  return (
    <FeatureFlagsContext.Provider value={featureFlags}>{children}</FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsValue {
  return useContext(FeatureFlagsContext);
}

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return useContext(FeatureFlagsContext)[flag];
}
