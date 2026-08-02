import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Deletes a user's own AI history: request logs, cached responses, the
 * AI memory/context snapshot, and chat data. Never touches
 * ai_credit_transactions (billing ledger, retained per
 * docs/product/ai-product-specification.md §1.11) or any aggregate,
 * anonymized analytics.
 *
 * Uses supabaseAdmin rather than the session-scoped client because
 * ai_requests/ai_user_memory have no delete RLS policy (only
 * select-own), and ai_response_cache is deliberately service-role-only
 * with zero user-facing policies at all — this route is the one place
 * a user's own deletion request is allowed to reach those tables, and
 * every query below is explicitly scoped to the verified caller's own
 * user_id, never a client-supplied id.
 */
export async function DELETE() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const [aiRequests, cacheEntries, memory, chatSessions, chatHistory] = await Promise.all([
      supabaseAdmin.from("ai_requests").delete({ count: "exact" }).eq("user_id", userId),
      supabaseAdmin.from("ai_response_cache").delete({ count: "exact" }).eq("user_id", userId),
      supabaseAdmin.from("ai_user_memory").delete({ count: "exact" }).eq("user_id", userId),
      // chat_messages cascades via its session_id FK (on delete cascade),
      // so deleting chat_sessions is sufficient for both tables.
      supabaseAdmin.from("chat_sessions").delete({ count: "exact" }).eq("user_id", userId),
      supabaseAdmin.from("chat_history").delete({ count: "exact" }).eq("user_id", userId),
    ]);

    const firstError =
      aiRequests.error ??
      cacheEntries.error ??
      memory.error ??
      chatSessions.error ??
      chatHistory.error;

    if (firstError) throw firstError;

    return Response.json({
      success: true,
      deleted: {
        aiRequests: aiRequests.count ?? 0,
        cacheEntries: cacheEntries.count ?? 0,
        memory: memory.count ?? 0,
        chatSessions: chatSessions.count ?? 0,
        chatHistory: chatHistory.count ?? 0,
      },
    });
  } catch (error) {
    console.error("AI history deletion error:", error);

    return Response.json(
      { success: false, message: "Failed to delete AI history. Please try again." },
      { status: 500 }
    );
  }
}
