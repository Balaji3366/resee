import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {
      message,
      history = [],
      sessionId,
    } = await req.json();

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const { data, error } = await supabaseAdmin
        .from("chat_sessions")
        .insert({
          title: message.slice(0, 40),
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      currentSessionId = data.id;
    }

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

    await supabaseAdmin.from("chat_history").insert({
      user_message: message,
      ai_response: response.text,
    });

    await supabaseAdmin.from("chat_messages").insert([
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