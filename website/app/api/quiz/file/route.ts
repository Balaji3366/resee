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

    const { fileName, difficulty, questions } = await req.json();

    if (!fileName) {
      return Response.json(
        {
          success: false,
          error: "File name is required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.storage.from("uploads").download(fileName);

    if (error || !data) {
      throw new Error("Unable to download file.");
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    const result = await runLegacyAIRequest({
      userId: user.id,
      feature: "legacy_quiz_file_generator",
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          text: `
Generate exactly ${questions} multiple choice questions.

Difficulty: ${difficulty}

Return ONLY Markdown.

Format:

## Question 1

Question

A.
B.
C.
D.

**Answer:** A

---

Do not return JSON.
Do not return HTML.
`,
        },
      ],
      attachment: {
        mimeType: "application/pdf",
        data: buffer.toString("base64"),
      },
      params: { fileName, difficulty, questions },
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
      quiz: result.data,
    });
  } catch (error: unknown) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate quiz.",
      },
      { status: 500 }
    );
  }
}
