import { supabaseAdmin } from "@/lib/supabase-admin";
import { featureFlags as staticDefaults } from "@/lib/config/featureFlags.config";
import type { FeatureFlag } from "@/lib/config/featureFlags.config";

export interface FeatureFlagRow {
  slug: FeatureFlag;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
}

/**
 * `feature_flags` is now the authoritative VALUE for each flag — the
 * static config remains authoritative for which flag KEYS exist and
 * their fallback default, same "DB overrides descriptive config"
 * pattern already used for subscription_plans vs.
 * lib/config/subscription.config.ts. A flag with no DB row yet falls
 * back to its static default rather than erroring.
 */
export async function getFeatureFlags(): Promise<Record<FeatureFlag, boolean>> {
  const { data } = await supabaseAdmin.from("feature_flags").select("slug, enabled");

  const overrides = new Map((data ?? []).map((row) => [row.slug as FeatureFlag, row.enabled]));

  const result = {} as Record<FeatureFlag, boolean>;
  for (const key of Object.keys(staticDefaults) as FeatureFlag[]) {
    result[key] = overrides.get(key) ?? staticDefaults[key];
  }

  return result;
}

export async function getFeatureFlagDetails(): Promise<FeatureFlagRow[]> {
  const { data } = await supabaseAdmin
    .from("feature_flags")
    .select("slug, enabled, description, updated_at")
    .order("slug");

  return (data ?? []).map((row) => ({
    slug: row.slug as FeatureFlag,
    enabled: row.enabled,
    description: row.description,
    updatedAt: row.updated_at,
  }));
}

export async function setFeatureFlag(slug: FeatureFlag, enabled: boolean): Promise<void> {
  await supabaseAdmin
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("slug", slug);
}
