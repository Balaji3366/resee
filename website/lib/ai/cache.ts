import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AIFeature } from "@/types/ai";

/**
 * Caches actual AI *responses* (distinct from lib/ai/memory.ts, which
 * caches *context*) — identical feature+context+params within the TTL
 * skip the provider call entirely.
 */
export function buildCacheKey(feature: AIFeature, contextHash: string, params: unknown): string {
  const raw = `${feature}:${contextHash}:${JSON.stringify(params)}`;
  return createHash("sha256").update(raw).digest("hex");
}

export async function getCachedResponse<T>(cacheKey: string): Promise<T | null> {
  const { data } = await supabaseAdmin
    .from("ai_response_cache")
    .select("response, expires_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  return data.response as T;
}

export async function setCachedResponse(
  cacheKey: string,
  feature: AIFeature,
  response: unknown,
  ttlSeconds: number,
  userId?: string
): Promise<void> {
  await supabaseAdmin.from("ai_response_cache").upsert({
    cache_key: cacheKey,
    feature,
    response,
    expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    // Nullable — lets a user's own cached responses be found and removed
    // via the "Delete my AI history" privacy action. Historical rows
    // predating this column stay unattributed and simply expire on TTL.
    user_id: userId ?? null,
  });
}
