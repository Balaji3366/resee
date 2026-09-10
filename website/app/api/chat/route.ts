import { GoogleGenAI } from "@google/genai";
import { getServerSupabase } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/ai/rateLimiter";
import { logAIRequest } from "@/lib/ai/logger";
import { toRedactedParams, validatePromptInput } from "@/lib/ai/security";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ reply: "Unauthorized." }, { status: 401 });
    }

    // Parsed and validated BEFORE any DB write or LLM call (A-M2/A-L1) —
    // a malformed body, a missing/non-string/empty message must never
    // reach the session-creation query or the paid provider call below.
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (typeof body !== "object" || body === null) {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const {
      message,
      history = [],
      sessionId,
    } = body as {
      message?: unknown;
      history?: { sender: string; text: string }[];
      sessionId?: string;
    };

    if (typeof message !== "string") {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    // Same length/emptiness gate already used for every other AI feature
    // (lib/ai/workspaceRequest.ts's checkWorkspaceTurn) — reused rather
    // than inventing a second, inconsistent limit for this route.
    const validation = validatePromptInput(message);
    if (!validation.valid) {
      return Response.json({ error: validation.reason }, { status: 400 });
    }

    // Rate limit checked before the session write below — a caller
    // already over budget shouldn't still cost a DB insert (A-M3).
    const rateLimit = await checkRateLimit(user.id, "legacy_chat_assistant");
    if (!rateLimit.allowed) {
      await logAIRequest({
        userId: user.id,
        feature: "legacy_chat_assistant",
        provider: "gemini",
        model: "models/gemini-3-flash-preview",
        status: "rate_limited",
        paramsRedacted: toRedactedParams({ sessionId }),
      });

      return Response.json(
        { reply: `Too many requests. Try again in ${rateLimit.resetInSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetInSeconds) } }
      );
    }

    let currentSessionId = sessionId;

    if (currentSessionId) {
      // Only reuse a session that actually belongs to the caller.
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", currentSessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        return Response.json({ reply: "Chat session not found." }, { status: 404 });
      }
    } else {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: message.slice(0, 40),
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      currentSessionId = data.id;
    }

    const startedAt = Date.now();

    const response = await ai.models.generateContent({
      model: "models/gemini-3-flash-preview",
      contents: `
You are RESEE AI, a professional AI career assistant.

Your job is to help students, developers and job seekers learn better.

Follow these rules:

- Always answer in Markdown.
- Use headings when appropriate.
- Use bullet points for explanations.
- Explain concepts in very simple English.
- If the question is about programming, include well-formatted code examples.
- If the user is preparing for interviews, provide practical interview tips.
- If the user asks about resumes or careers, give actionable suggestions.
- Never give one-line answers unless the question requires it.
- End every response with a small tip or encouragement.

Conversation History:

${history
  .slice(-10)
  .map((msg: { sender: string; text: string }) => `${msg.sender}: ${msg.text}`)
  .join("\n")}

User Question:

${message}
`,
    });

    await logAIRequest({
      userId: user.id,
      feature: "legacy_chat_assistant",
      provider: "gemini",
      model: "models/gemini-3-flash-preview",
      status: "success",
      latencyMs: Date.now() - startedAt,
      paramsRedacted: toRedactedParams({ sessionId: currentSessionId }),
    });

    await supabase.from("chat_history").insert({
      user_id: user.id,
      user_message: message,
      ai_response: response.text,
    });

    await supabase.from("chat_messages").insert([
      {
        session_id: currentSessionId,
        sender: "You",
        message,
      },
      {
        session_id: currentSessionId,
        sender: "AI",
        message: response.text,
      },
    ]);

    return Response.json({
      reply: response.text,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return Response.json(
      {
        reply: "❌ Something went wrong.",
      },
      { status: 500 }
    );
  }
}
