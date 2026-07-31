import { GoogleGenAI } from "@google/genai";
import type { AIProvider, AIProviderRequest, AIProviderResult } from "./types";

const MODEL = "gemini-3-flash-preview";
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

function isRetryable(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return status === 429 || (typeof status === "number" && status >= 500);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The only real, working provider adapter in this codebase — reuses
 * @google/genai (the sole SDK every existing AI route already depends
 * on). Normalizes what the 8 existing routes each did inconsistently:
 * a single `[{role:"user", parts:[{text}]}]` contents shape, plain
 * `response.text` extraction, and exponential-backoff retry gated on
 * 429/5xx only (existing code either never retries, or retries blindly
 * on any error with a fixed delay).
 */
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;

  constructor(apiKey: string = process.env.GEMINI_API_KEY!) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResult> {
    const combinedText = request.messages.map((m) => m.text).join("\n\n");

    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const response = await this.client.models.generateContent({
          model: MODEL,
          contents: [{ role: "user", parts: [{ text: combinedText }] }],
        });

        return {
          text: response.text ?? "",
          model: MODEL,
          promptTokens: response.usageMetadata?.promptTokenCount ?? null,
          completionTokens: response.usageMetadata?.candidatesTokenCount ?? null,
          totalTokens: response.usageMetadata?.totalTokenCount ?? null,
        };
      } catch (error) {
        lastError = error;

        if (attempt === MAX_ATTEMPTS - 1 || !isRetryable(error)) {
          throw error;
        }

        await wait(BASE_DELAY_MS * 2 ** attempt);
      }
    }

    throw lastError;
  }
}
