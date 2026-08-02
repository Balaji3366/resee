import { extractText, getDocumentProxy } from "unpdf";
import { getServerSupabase } from "@/lib/supabaseServer";
import { runLegacyAIRequest } from "@/lib/ai/legacyRequest";
import { safeJsonParse } from "@/lib/ai/responseParser";
import { aiErrorStatus } from "@/lib/ai/errorHandler";

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const file = formData.get("resume") as File | null;

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "No resume uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const pdf = await getDocumentProxy(new Uint8Array(bytes));

    const { text: resumeText } = await extractText(pdf, {
      mergePages: true,
    });

    const prompt = `
You are an expert ATS Resume Analyzer.

Analyze the following resume.

Resume:

${resumeText}

Return ONLY valid JSON.

Schema:

{
  "atsScore": 0,
  "summary": "",
  "strengths": [
    "",
    "",
    "",
    ""
  ],
  "weaknesses": [
    "",
    "",
    "",
    ""
  ],
  "missingKeywords": [
    "",
    "",
    "",
    ""
  ],
  "suggestions": [
    "",
    "",
    "",
    ""
  ]
}

Rules:

- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT wrap JSON inside \`\`\`.
- ATS score must be between 0 and 100.
- Summary must be under 40 words.
- Each array must contain exactly 4 points.
- Each point must be under 20 words.
- Give a realistic ATS score.
`;

    const result = await runLegacyAIRequest({
      userId: user.id,
      feature: "legacy_resume_analyzer",
      messages: [{ role: "user", text: prompt }],
      params: { fileName: file.name, fileSize: file.size },
    });

    if (!result.success) {
      return Response.json(
        { success: false, message: result.error.message },
        { status: aiErrorStatus(result.error.code) }
      );
    }

    if (!result.data.trim()) {
      throw new Error("Empty response from Gemini.");
    }

    const parsed = safeJsonParse<Record<string, unknown>>(result.data);

    if (!parsed.success) {
      throw new Error(parsed.error);
    }

    return Response.json({
      success: true,
      resumeText,
      data: parsed.data,
    });
  } catch (error: unknown) {
    console.error("Resume Analyzer Error:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while analyzing the resume.",
      },
      {
        status: 500,
      }
    );
  }
}
