export interface AIProviderAttachment {
  mimeType: string;
  /** Base64-encoded file bytes. */
  data: string;
}

export interface AIProviderMessage {
  role: "system" | "user";
  text: string;
}

export interface AIProviderRequest {
  messages: AIProviderMessage[];
  /** 0-1, lower = more deterministic. Not every provider needs this. */
  temperature?: number;
  /** A single inline file (e.g. an uploaded PDF) attached to the request —
   *  several legacy routes (interview/quiz/summarize/pdf-chat generation)
   *  send a document alongside the prompt text; this is the seam that
   *  lets them adopt the shared provider without losing that capability. */
  attachment?: AIProviderAttachment;
  /** Overrides the provider's default model for this call only — e.g. a
   *  legacy route pinned to an older model string that must not silently
   *  change as part of standardizing onto the shared provider. */
  model?: string;
}

export interface AIProviderResult {
  text: string;
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

/**
 * The seam every AI provider adapter implements. Only `GeminiProvider`
 * (lib/ai/providers/gemini.ts) is a real, working implementation today —
 * it's the only SDK actually exercised anywhere in this codebase.
 * Adding a second provider (OpenAI, Anthropic, ...) later means writing
 * a class that satisfies this interface, not touching any caller.
 */
export interface AIProvider {
  readonly name: string;
  generate(request: AIProviderRequest): Promise<AIProviderResult>;
}
