import { supabaseAdmin } from "@/lib/supabase-admin";
import { limitsConfig } from "@/lib/config/limits.config";
import type { AIFeature } from "@/types/ai";

const WINDOW_SECONDS = limitsConfig.ai.windowSeconds;
const MAX_REQUESTS_PER_WINDOW = limitsConfig.ai.maxRequestsPerWindow;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * A technical abuse-prevention limit (separate from the business-level
 * credit limit) — a sliding window counted against ai_requests, the
 * same table the AI Logging component already writes to. No Redis/
 * in-memory store exists anywhere in this codebase, so this is
 * Postgres-backed, matching "maintain the existing project architecture."
 */
export async function checkRateLimit(userId: string, feature: AIFeature): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from("ai_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature", feature)
    .gte("created_at", windowStart);

  const used = count ?? 0;

  return {
    allowed: used < MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - used),
    resetInSeconds: WINDOW_SECONDS,
  };
}
