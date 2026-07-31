import { GeminiProvider } from "./gemini";
import type { AIProvider } from "./types";

export type { AIProvider, AIProviderMessage, AIProviderRequest, AIProviderResult } from "./types";

let geminiInstance: GeminiProvider | null = null;

/**
 * Provider factory — defaults to Gemini, the only real adapter today.
 * A future second provider registers here; nothing else changes.
 */
export function getProvider(name: "gemini" = "gemini"): AIProvider {
  if (name === "gemini") {
    if (!geminiInstance) geminiInstance = new GeminiProvider();
    return geminiInstance;
  }

  throw new Error(`Unknown AI provider: ${name}`);
}
