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
          error: "File name is required.",
        },
        { status: 400 }
      );
    }

    // Download PDF from Supabase Storage
    const { data, error } = await supabaseAdmin.storage.from("uploads").download(fileName);

    if (error || !data) {
      throw new Error("Unable to download PDF.");
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    const result = await runLegacyAIRequest({
      userId: user.id,
      feature: "legacy_interview_questions",
      messages: [
        {
          role: "user",
          text: `
Generate 10 interview questions from this PDF.

Requirements:
- Divide into three sections:
  1. HR Questions
  2. Technical Questions
  3. Scenario Based Questions
- Mention difficulty (Easy / Medium / Hard).
- Keep questions professional.
- Return only the interview questions.
`,
        },
      ],
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
      interview: result.data,
    });
  } catch (error: unknown) {
    console.error("INTERVIEW ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate interview questions.",
      },
      { status: 500 }
    );
  }
}
