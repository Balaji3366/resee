import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { needsLiveSearch } from "@/lib/utils/classifyQuery";
import { liveSearch } from "@/lib/search/liveSearch";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
function getCurrentDateContext() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    date: now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    day: now.toLocaleDateString("en-US", {
      weekday: "long",
    }),
    month: now.toLocaleDateString("en-US", {
      month: "long",
    }),
  };
}
export async function POST(req: Request) {
  try {
    const {
      message,
      history = [],
      sessionId,
      attachment,
    } = await req.json();

    let currentSessionId = sessionId;
    const current = getCurrentDateContext();
    let searchResults = "";

if (needsLiveSearch(message)) {
  searchResults = await liveSearch(message);
}

    // Create session if needed
    if (!currentSessionId) {
      const { data, error } = await supabaseAdmin
        .from("chat_sessions")
        .insert({
          title: message.slice(0, 40),
        })
        .select("id")
        .single();

      if (error) throw error;

      currentSessionId = data.id;
    }
const prompt = `
You are **RESEE AI**, a professional AI Career Assistant.

==================================================
CURRENT DATE & TIME (SOURCE OF TRUTH)
==================================================

Today's Date: ${current.date}
Current Day: ${current.day}
Current Month: ${current.month}
Current Year: ${current.year}

IMPORTANT:
- These values are always correct.
- Never guess today's date.
- Never answer with another year.
- If the user asks "What is today's date?", "What is the current year?", "What day is today?", always use the values above.

==================================================
IDENTITY
==================================================

Your name is RESEE AI.

Never say you are:
- ChatGPT
- Gemini
- Google AI
- OpenAI

If someone asks "Who are you?", reply:
"I'm RESEE AI, your AI Career Assistant."

==================================================
LANGUAGE
==================================================

- Detect the language of the user's latest message.
- Reply in the same language.
- If the user mixes Telugu + English, reply naturally in Telugu + English.
- Do not force English.
- Keep technical words like Resume, ATS, API, React, Next.js, JavaScript, TypeScript, Python, SQL and company names in English.

==================================================
RESPONSE STYLE
==================================================

- Give short answers for simple questions.
- Give detailed answers for career, interview, coding and learning questions.
- Explain clearly using simple language.
- When required, provide step-by-step guidance.

==================================================
MARKDOWN RULES
==================================================

- Return valid GitHub Markdown.
- Use headings only when useful.
- Use bullet points when needed.
- Bold important words.
- Use code blocks ONLY for programming code or commands.
- Do not use code blocks for normal explanations.
- Leave one blank line between sections.
- End long answers with:

## 💡 Tip

Follow with one practical tip.

==================================================
CONVERSATION HISTORY
==================================================

${history
  .slice(-8)
  .map(
    (msg: { sender: string; text: string }) =>
      `${msg.sender}: ${msg.text}`
  )
  .join("\n")}

${
  attachment
    ? `
==================================================
ATTACHED FILE
==================================================

Name: ${attachment.name}
Type: ${attachment.type}
URL: ${attachment.url}
`
    : ""
}
==================================================
LIVE SEARCH RESULTS
==================================================

${searchResults || "No live search results available."}

IMPORTANT:

- If live search results are available, use them as the primary source.
- Do not contradict verified search results.
- If there are no live search results, answer using your own knowledge.
==================================================
USER QUESTION
==================================================

${message}
`;
    const stream = await ai.models.generateContentStream({
      model: "models/gemini-3-flash-preview",
      contents: prompt,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        // Send session id first
        controller.enqueue(
          encoder.encode(
            `event: session\ndata: ${JSON.stringify({
              sessionId: currentSessionId,
            })}\n\n`
          )
        );

        try {
          for await (const chunk of stream) {
            const text = chunk.text ?? "";
            if (!text) continue;

            fullResponse += text;

            controller.enqueue(
              encoder.encode(
                `event: chunk\ndata: ${JSON.stringify({
                  text,
                })}\n\n`
              )
            );
          }

          // Save messages after streaming completes
          const { error } = await supabaseAdmin
            .from("chat_messages")
            .insert([
              {
                session_id: currentSessionId,
                sender: "You",
                message,

                attachment_name: attachment?.name ?? null,
                attachment_url: attachment?.url ?? null,
                attachment_type: attachment?.type ?? null,
                attachment_size: attachment?.size ?? null,
              },
              {
                session_id: currentSessionId,
                sender: "AI",
                message: fullResponse,
              },
            ]);

            if (error) {
            console.error("Failed to save messages:", error);
            }

          controller.enqueue(
            encoder.encode(
              `event: done\ndata: {}\n\n`
            )
          );

          controller.close();
        } catch (err) {
          console.error(err);

          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                message: "Streaming failed",
              })}\n\n`
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

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}