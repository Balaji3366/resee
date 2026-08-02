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

    const { resumeText, analysis } = await request.json();

    if (!resumeText) {
      return Response.json(
        {
          success: false,
          message: "Resume text is required.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert ATS Resume Writer.

Below is the candidate resume.

========================
${resumeText}
========================

ATS Analysis:
${JSON.stringify(analysis, null, 2)}

Rewrite the resume professionally.

Rules:
- Improve grammar.
- Improve ATS friendliness.
- Add ATS keywords naturally.
- Use powerful action verbs.
- Keep everything truthful.
- Do NOT invent projects.
- Do NOT invent experience.
- Do NOT invent certifications.

Return ONLY valid JSON.

{
  "name": "",
  "email": "",
  "phone": "",
  "summary": "",
  "skills": [],
  "experience": [
    {
      "company": "",
      "role": "",
      "location": "",
      "duration": "",
      "points": []
    }
  ],
  "education": [
    {
      "degree": "",
      "college": "",
      "year": ""
    }
  ]
}

Return JSON only.
Do not use markdown.
Do not explain anything.
`;

    const result = await runLegacyAIRequest({
      userId: user.id,
      feature: "legacy_resume_rewrite",
      messages: [{ role: "user", text: prompt }],
      params: { resumeTextLength: resumeText.length },
    });

    if (!result.success) {
      return Response.json(
        { success: false, message: result.error.message },
        { status: aiErrorStatus(result.error.code) }
      );
    }

    const parsed = safeJsonParse<Record<string, unknown>>(result.data);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: "Gemini returned invalid JSON.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: parsed.data,
    });
  } catch (error: unknown) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to improve resume.",
      },
      { status: 500 }
    );
  }
}
