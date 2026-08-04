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
type ContentPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;

  constructor(apiKey: string = process.env.GEMINI_API_KEY!) {
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Shared by generate() and generateStream() — both send the same
   * single-turn shape (all message text joined, plus an optional inline
   * attachment), matching the convention every caller of this provider
   * already relies on. Extracted here so streaming didn't require a
   * second, drifting copy of this logic.
   */
  private buildContents(request: AIProviderRequest): { role: "user"; parts: ContentPart[] }[] {
    const combinedText = request.messages.map((m) => m.text).join("\n\n");

    const parts: ContentPart[] = [];
    if (request.attachment) {
      parts.push({
        inlineData: { mimeType: request.attachment.mimeType, data: request.attachment.data },
      });
    }
    parts.push({ text: combinedText });

    return [{ role: "user", parts }];
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResult> {
    const model = request.model ?? MODEL;
    const contents = this.buildContents(request);

    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const response = await this.client.models.generateContent({ model, contents });

        return {
          text: response.text ?? "",
          model,
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

  /**
   * No retry loop here, unlike generate() — a stream that's already
   * begun emitting chunks to a caller can't be transparently retried
   * without either replaying already-sent text or the caller tracking
   * dedup itself. Retryable failures before the first chunk still throw
   * the same normalizable error generate() would, which the AI Workspace
   * orchestration (lib/ai/workspaceRequest.ts) surfaces the same way
   * runAIRequest() surfaces any other provider error.
   */
  async *generateStream(
    request: AIProviderRequest
  ): AsyncGenerator<string, AIProviderResult, void> {
    const model = request.model ?? MODEL;
    const contents = this.buildContents(request);

    const stream = await this.client.models.generateContentStream({ model, contents });

    let fullText = "";
    let promptTokens: number | null = null;
    let completionTokens: number | null = null;
    let totalTokens: number | null = null;

    for await (const chunk of stream) {
      const text = chunk.text ?? "";
      if (text) {
        fullText += text;
        yield text;
      }
      if (chunk.usageMetadata) {
        promptTokens = chunk.usageMetadata.promptTokenCount ?? promptTokens;
        completionTokens = chunk.usageMetadata.candidatesTokenCount ?? completionTokens;
        totalTokens = chunk.usageMetadata.totalTokenCount ?? totalTokens;
      }
    }

    return { text: fullText, model, promptTokens, completionTokens, totalTokens };
  }
}
