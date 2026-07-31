import { supabaseAdmin } from "@/lib/supabase-admin";
import { limitsConfig } from "@/lib/config/limits.config";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * General-purpose sibling to lib/ai/rateLimiter.ts, for any future route
 * outside the AI module — backed by api_requests (see
 * supabase/migrations/0013_platform_foundation.sql), same Postgres
 * sliding-window approach, no Redis introduced. Not wired into any route
 * yet in Sprint 1 (no existing route is both unauthenticated and
 * mutating) — ships ready for a future route to call.
 */
export async function checkGeneralRateLimit(
  userId: string,
  route: string
): Promise<RateLimitResult> {
  const { windowSeconds, maxRequestsPerWindow } = limitsConfig.general;
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from("api_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("route", route)
    .gte("created_at", windowStart);

  const used = count ?? 0;

  return {
    allowed: used < maxRequestsPerWindow,
    remaining: Math.max(0, maxRequestsPerWindow - used),
    resetInSeconds: windowSeconds,
  };
}
