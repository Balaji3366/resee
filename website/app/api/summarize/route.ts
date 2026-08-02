import { supabaseAdmin } from "@/lib/supabase-admin";
import { getServerSupabase } from "@/lib/supabaseServer";
import { runLegacyAIRequest } from "@/lib/ai/legacyRequest";
import { aiErrorStatus } from "@/lib/ai/errorHandler";

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { fileName } = await req.json();

    if (!fileName) {
      return Response.json(
        {
          success: false,
          error: "File name is required",
        },
        {
          status: 400,
        }
      );
    }

    // Download PDF from Supabase Storage
    const { data, error } = await supabaseAdmin.storage.from("uploads").download(fileName);

    if (error || !data) {
      return Response.json(
        {
          success: false,
          error: "Unable to download PDF from Storage.",
        },
        {
          status: 500,
        }
      );
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    const result = await runLegacyAIRequest({
      userId: user.id,
      feature: "legacy_pdf_summarizer",
      messages: [{ role: "user", text: "Summarize this PDF into simple bullet points." }],
      attachment: {
        mimeType: "application/pdf",
        data: buffer.toString("base64"),
      },
      params: { fileName },
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
      summary: result.data,
    });
  } catch (error: unknown) {
    console.error("SUMMARY ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to summarize PDF.",
      },
      {
        status: 500,
      }
    );
  }
}
