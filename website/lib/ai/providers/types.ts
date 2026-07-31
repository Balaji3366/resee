export interface AIProviderMessage {
  role: "system" | "user";
  text: string;
}

export interface AIProviderRequest {
  messages: AIProviderMessage[];
  /** 0-1, lower = more deterministic. Not every provider needs this. */
  temperature?: number;
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
