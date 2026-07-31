import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { fileName, question } = await req.json();

    if (!fileName || !question) {
      return Response.json(
        {
          success: false,
          error: "File name and question are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.storage.from("uploads").download(fileName);

    if (error || !data) {
      throw new Error("Failed to download PDF from Storage.");
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: buffer.toString("base64"),
          },
        },
        {
          text: `Answer this question only using the uploaded PDF.

Question:
${question}`,
        },
      ],
    });

    return Response.json({
      success: true,
      answer: response.text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}
