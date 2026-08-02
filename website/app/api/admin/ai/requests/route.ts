import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminAIRequestLogEntry } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 25));
    const status = url.searchParams.get("status");
    const feature = url.searchParams.get("feature");

    let query = supabaseAdmin
      .from("ai_requests")
      .select(
        "id, user_id, feature, provider, model, status, prompt_tokens, completion_tokens, total_tokens, latency_ms, error_message, params_redacted, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (feature) query = query.eq("feature", feature);

    const start = (page - 1) * pageSize;
    const { data, count, error } = await query.range(start, start + pageSize - 1);

    if (error) throw error;

    const requests: AdminAIRequestLogEntry[] = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      feature: row.feature,
      provider: row.provider,
      model: row.model,
      status: row.status,
      promptTokens: row.prompt_tokens,
      completionTokens: row.completion_tokens,
      totalTokens: row.total_tokens,
      latencyMs: row.latency_ms,
      errorMessage: row.error_message,
      paramsRedacted: row.params_redacted,
      createdAt: row.created_at,
    }));

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return Response.json({ success: true, requests, total, page, pageSize, totalPages });
  } catch (error) {
    console.error("Admin AI requests list error:", error);

    return Response.json(
      { success: false, message: "Failed to load AI request logs." },
      { status: 500 }
    );
  }
}
