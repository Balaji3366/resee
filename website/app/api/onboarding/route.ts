import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { OnboardingAnswers } from "@/types/onboarding";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userId: string | undefined = body.userId;
    const answers: OnboardingAnswers | undefined = body.answers;

    if (!userId || !answers) {
      return Response.json(
        {
          success: false,
          message: "Missing user or onboarding answers.",
        },
        {
          status: 400,
        }
      );
    }

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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() || "";

    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiSummary = JSON.parse(cleanText);

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

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while generating your career profile.";

    return Response.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}
