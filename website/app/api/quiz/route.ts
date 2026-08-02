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

    const { data, error } = await supabaseAdmin.storage.from("uploads").download(fileName);

    if (error || !data) {
      throw new Error("Unable to download PDF.");
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    const result = await runLegacyAIRequest({
      userId: user.id,
      feature: "legacy_quiz_generator",
      messages: [
        {
          role: "user",
          text: `
Generate exactly 10 multiple choice questions.

Return the output in Markdown format.

Example:

## Question 1
What is Python?

A. Language A
B. Language B
C. Language C
D. Language D

**Answer:** B

---

## Question 2
...

Do not return JSON.
Do not return HTML.
Only Markdown.
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
      quiz: result.data,
    });
  } catch (error: unknown) {
    console.error("QUIZ ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate quiz.",
      },
      { status: 500 }
    );
  }
}
