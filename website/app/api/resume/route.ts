import { GoogleGenAI } from "@google/genai";
import { extractText, getDocumentProxy } from "unpdf";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
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

    console.log("✅ PDF extracted");

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

    console.log("✅ Gemini response received");

    const text = response.text?.trim() || "";

    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    console.log("Gemini Raw Response:");
    console.log(text);

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanText);

    return Response.json({
      success: true,
      resumeText,
      data: result,
    });
  } catch (error: any) {
    console.error("Resume Analyzer Error:", error);

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Something went wrong while analyzing the resume.",
      },
      {
        status: 500,
      }
    );
  }
}