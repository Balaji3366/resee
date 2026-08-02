import { GoogleGenAI } from "@google/genai";
import { getServerSupabase } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/ai/rateLimiter";
import { logAIRequest } from "@/lib/ai/logger";
import { toRedactedParams } from "@/lib/ai/security";

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

    const { message, history = [], sessionId } = await req.json();

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

    const rateLimit = await checkRateLimit(user.id, "legacy_chat_assistant");
    if (!rateLimit.allowed) {
      await logAIRequest({
        userId: user.id,
        feature: "legacy_chat_assistant",
        provider: "gemini",
        model: "models/gemini-3-flash-preview",
        status: "rate_limited",
        paramsRedacted: toRedactedParams({ sessionId: currentSessionId }),
      });

      return Response.json(
        { reply: `Too many requests. Try again in ${rateLimit.resetInSeconds} seconds.` },
        { status: 429 }
      );
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
