import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logging/logger";

export interface LogRequestParams {
  userId: string | null;
  route: string;
  method: string;
  status: number;
  latencyMs: number;
}

/**
 * Thin wrapper any route can call to log into the new api_requests table
 * (supabase/migrations/0013_platform_foundation.sql) — same shape as
 * lib/ai/logger.ts's logAIRequest, generalized beyond the AI module. Not
 * wired into any existing route in Sprint 1 (no route call sites were
 * added — this ships as the utility future routes adopt).
 */
export async function logRequest(params: LogRequestParams): Promise<void> {
  const { error } = await supabaseAdmin.from("api_requests").insert({
    user_id: params.userId,
    route: params.route,
    method: params.method,
    status: params.status,
    latency_ms: params.latencyMs,
  });

  if (error) {
    logger.error("Request logging failed", { error: error.message });
  }
}
