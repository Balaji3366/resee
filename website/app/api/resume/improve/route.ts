import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
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

    let improvedResume;

    try {
      improvedResume = JSON.parse(text);
    } catch {
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
      data: improvedResume,
    });
  } catch (error: any) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message || "Failed to improve resume.",
      },
      { status: 500 }
    );
  }
}