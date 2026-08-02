import { supabaseAdmin } from "@/lib/supabase-admin";
import { getServerSupabase } from "@/lib/supabaseServer";
import { validateBody } from "@/lib/validation/validateBody";
import { onboardingRequestSchema } from "@/lib/validation/schemas/onboarding.schema";
import { jsonError } from "@/lib/http/responses";
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

    const validation = await validateBody(onboardingRequestSchema, request);

    if (!validation.success) {
      return jsonError(validation.error);
    }

    // The request body's userId is never trusted for authorization — the
    // profile written to is always the authenticated caller's own, taken
    // from the verified session instead of client input.
    const { answers } = validation.data;
    const userId = user.id;

    const prompt = `
You are an expert AI career mentor.

A user just completed onboarding on RESEE, an AI career platform. Analyze their profile and generate a career readiness summary.

User Profile:

Role: ${answers.userType}
Goal: ${answers.goal}
Target Career: ${answers.targetCareer}
Current Skill Level: ${answers.skillLevel}

Return ONLY valid JSON.

Schema:

{
  "careerHealthScore": 0,
  "summary": "",
  "strengths": [
    "",
    "",
    ""
  ],
  "gaps": [
    "",
    "",
    ""
  ],
  "focusAreas": [
    "",
    "",
    ""
  ],
  "recommendedFirstSteps": [
    "",
    "",
    ""
  ]
}

Rules:

- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT wrap JSON inside \`\`\`.
- careerHealthScore must be between 0 and 100, based on how ready the user is for their target career.
- Summary must be under 40 words, encouraging and specific to this user.
- Each array must contain exactly 3 points.
- Each point must be under 20 words.
`;

    const result = await runLegacyAIRequest({
      userId,
      feature: "legacy_onboarding_summary",
      messages: [{ role: "user", text: prompt }],
      params: {
        userType: answers.userType,
        goal: answers.goal,
        targetCareer: answers.targetCareer,
      },
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

    const aiSummary = parsed.data;

    const { error } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      role_type: answers.userType,
      goal: answers.goal,
      target_career: answers.targetCareer,
      skill_level: answers.skillLevel,
      ai_summary: aiSummary,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      success: true,
      data: aiSummary,
    });
  } catch (error) {
    console.error("Onboarding Error:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating your career profile.",
      },
      {
        status: 500,
      }
    );
  }
}
