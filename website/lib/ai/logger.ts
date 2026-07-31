import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AIFeature, AIRequestStatus } from "@/types/ai";

export interface LogAIRequestParams {
  userId: string;
  feature: AIFeature;
  provider: string;
  model: string;
  status: AIRequestStatus;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  latencyMs?: number | null;
  errorMessage?: string | null;
}

/** Writes one row to ai_requests — the AI Logging component. */
export async function logAIRequest(params: LogAIRequestParams): Promise<void> {
  const { error } = await supabaseAdmin.from("ai_requests").insert({
    user_id: params.userId,
    feature: params.feature,
    provider: params.provider,
    model: params.model,
    status: params.status,
    prompt_tokens: params.promptTokens ?? null,
    completion_tokens: params.completionTokens ?? null,
    total_tokens: params.totalTokens ?? null,
    latency_ms: params.latencyMs ?? null,
    error_message: params.errorMessage ?? null,
  });

  if (error) {
    // Logging must never take down the calling feature — surface to
    // server logs only.
    console.error("AI request logging failed:", error);
  }
}
