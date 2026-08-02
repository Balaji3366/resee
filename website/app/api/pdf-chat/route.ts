import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { getServerSupabase } from "@/lib/supabaseServer";
import { runLegacyAIRequest } from "@/lib/ai/legacyRequest";
import { aiErrorStatus } from "@/lib/ai/errorHandler";

export async function POST(req: Request) {
  try {
    const sessionSupabase = await getServerSupabase();

    const {
      data: { user },
    } = await sessionSupabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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

    const result = await runLegacyAIRequest({
      userId: user.id,
      feature: "legacy_pdf_chat",
      messages: [
        {
          role: "user",
          text: `Answer this question only using the uploaded PDF.

Question:
${question}`,
        },
      ],
      attachment: {
        mimeType: "application/pdf",
        data: buffer.toString("base64"),
      },
      params: { fileName, question },
      cacheTtlSeconds: 300,
    });

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error.message },
        { status: aiErrorStatus(result.error.code) }
      );
    }

    return Response.json({
      success: true,
      answer: result.data,
    });
  } catch (error: unknown) {
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
