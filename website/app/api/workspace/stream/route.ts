import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { needsLiveSearch } from "@/lib/utils/classifyQuery";
import { liveSearch } from "@/lib/search/liveSearch";
import { logAIRequest } from "@/lib/ai/logger";
import { toRedactedParams } from "@/lib/ai/security";
import { getProvider } from "@/lib/ai/providers";
import {
  checkWorkspaceTurn,
  chargeWorkspaceSessionCredit,
  workspaceModeFeature,
  type WorkspaceMode,
} from "@/lib/ai/workspaceRequest";
import { buildWorkspaceContext } from "@/lib/ai/workspaceContext";
import { buildGeneralAssistantPrompt } from "@/lib/ai/prompts/generalAssistant";
import { buildCareerCoachSystemPrompt } from "@/lib/ai/prompts/careerCoaching";

/**
 * The AI Workspace's unified streaming endpoint
 * (docs/architecture/ai-workspace-architecture.md §3) — hosts both
 * General Assistant mode (unmetered, unchanged behaviour) and Career
 * Coach mode (context-grounded, session-billed, flag-gated) behind one
 * route, one SSE contract, and one session/message schema.
 *
 * app/api/chat/stream/route.ts is left running, unchanged, in parallel
 * during the migration window (docs/architecture/ai-workspace-
 * architecture.md §8.2) — this route is additive, not a rewrite of it.
 */

const DEFAULT_MODEL = "gemini-3-flash-preview";

function sseErrorStream(message: string, code?: string): Response {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`event: error\ndata: ${JSON.stringify({ message, code })}\n\n`)
      );
      controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return sseErrorStream("Unauthorized.");
    }

    const { message, history = [], sessionId, mode: requestedMode, attachment } = await req.json();

    let currentSessionId: string | null = sessionId ?? null;
    let mode: WorkspaceMode = requestedMode === "career_coach" ? "career_coach" : "general";
    let creditAlreadyCharged = false;

    if (currentSessionId) {
      // Ownership check first, and the session's OWN stored mode always
      // wins over whatever the client sent — mode is fixed for the
      // lifetime of a session (architecture doc §4.2), so a client can
      // never retroactively change what an existing session bills as.
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id, mode, credit_charged_at")
        .eq("id", currentSessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        return sseErrorStream("Chat session not found.");
      }

      mode = (existing.mode as WorkspaceMode) ?? "general";
      creditAlreadyCharged = Boolean(existing.credit_charged_at);
    }

    const check = await checkWorkspaceTurn(user.id, mode, message);
    if (!check.allowed) {
      return sseErrorStream(check.error!.message, check.error!.code);
    }

    const feature = workspaceModeFeature(mode);

    let searchResults = "";
    if (mode === "general" && needsLiveSearch(message)) {
      searchResults = await liveSearch(message);
    }

    // Create session if needed — same convention as the existing chat
    // routes (title = first 40 chars of the message).
    if (!currentSessionId) {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: message.slice(0, 40), mode })
        .select("id")
        .single();

      if (error) throw error;
      currentSessionId = data.id;
    }

    if (!currentSessionId) {
      throw new Error("Workspace session id was not resolved.");
    }

    // Career Coach mode: charge the session's one credit on its first
    // message only (Decision 2). The credit_charged_at update happens
    // immediately, before streaming starts, so a fast second message on
    // the same session can never see a stale "not yet charged" read.
    if (mode === "career_coach" && !creditAlreadyCharged) {
      const charge = await chargeWorkspaceSessionCredit(user.id, currentSessionId);
      if (!charge.charged) {
        return sseErrorStream(charge.error.message, charge.error.code);
      }

      // chat_sessions has no "update own" RLS policy (only
      // select/insert/delete_own — same three-pattern model every other
      // user-owned table in this project uses), so this write must go
      // through supabaseAdmin, not the cookie-scoped `supabase` client —
      // discovered live: the session-scoped client's update silently
      // affected zero rows (RLS denies it, no error surfaced), which was
      // caught by end-to-end verification. This mirrors how the credit
      // ledger itself is already only ever written via supabaseAdmin
      // (Decision 8) — credit_charged_at is that same integrity concern,
      // not a general user-editable field.
      await supabaseAdmin
        .from("chat_sessions")
        .update({ credit_charged_at: new Date().toISOString() })
        .eq("id", currentSessionId);
    }

    let prompt: string;

    if (mode === "career_coach") {
      const workspaceContext = await buildWorkspaceContext(user.id);
      prompt = buildCareerCoachSystemPrompt(
        workspaceContext.userContext,
        workspaceContext.intelligence,
        {
          message,
          history,
        }
      );
    } else {
      prompt = buildGeneralAssistantPrompt({ message, history, attachment, searchResults });
    }

    const provider = getProvider();
    const startedAt = Date.now();
    const stream = provider.generateStream({ messages: [{ role: "user", text: prompt }] });

    const encoder = new TextEncoder();
    const sessionIdForClosure = currentSessionId;

    const readable = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: session\ndata: ${JSON.stringify({ sessionId: sessionIdForClosure, mode })}\n\n`
          )
        );

        try {
          let fullResponse = "";
          let result: Awaited<ReturnType<typeof stream.next>> = await stream.next();

          while (!result.done) {
            const text = result.value;
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text })}\n\n`)
              );
            }
            result = await stream.next();
          }

          const providerResult = result.value;

          const { error: insertError } = await supabase.from("chat_messages").insert([
            {
              session_id: sessionIdForClosure,
              sender: "You",
              message,
              attachment_name: attachment?.name ?? null,
              attachment_url: attachment?.url ?? null,
              attachment_type: attachment?.type ?? null,
              attachment_size: attachment?.size ?? null,
            },
            {
              session_id: sessionIdForClosure,
              sender: "AI",
              message: fullResponse,
            },
          ]);

          if (insertError) {
            console.error("Failed to save workspace messages:", insertError);
          }

          await logAIRequest({
            userId: user.id,
            feature,
            provider: provider.name,
            model: providerResult.model ?? DEFAULT_MODEL,
            status: "success",
            promptTokens: providerResult.promptTokens,
            completionTokens: providerResult.completionTokens,
            totalTokens: providerResult.totalTokens,
            latencyMs: Date.now() - startedAt,
            paramsRedacted: toRedactedParams({ sessionId: sessionIdForClosure, mode }),
          });

          controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
          controller.close();
        } catch (err) {
          console.error(err);

          await logAIRequest({
            userId: user.id,
            feature,
            provider: "gemini",
            model: DEFAULT_MODEL,
            status: "error",
            latencyMs: Date.now() - startedAt,
            errorMessage: err instanceof Error ? err.message : "Streaming failed",
            paramsRedacted: toRedactedParams({ sessionId: sessionIdForClosure, mode }),
          });

          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: "Streaming failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
