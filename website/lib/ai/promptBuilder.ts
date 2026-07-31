import type { UserContext } from "@/types/ai";
import type { AIProviderMessage } from "./providers/types";

/**
 * Injects the real current date so the model never hallucinates the
 * year — the same idea already proven in app/api/chat/stream/route.ts's
 * getCurrentDateContext(), generalized for every feature.
 */
export function getCurrentDateContext(): string {
  const now = new Date();
  return `Today's date is ${now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}.`;
}

const IDENTITY_RULES = `You are ReSee's internal AI assistant, working silently behind a specific product feature.
Never mention that you are Gemini, Google, OpenAI, or any underlying provider.
Respond only in the exact format requested — no conversational preamble, no follow-up questions.`;

/**
 * Renders the parts of UserContext relevant to a prompt as a compact,
 * readable block. Callers pass only the fields that matter for their
 * feature — never the whole object — to keep prompts small and avoid
 * leaking unrelated personal data into a request that doesn't need it.
 */
export function formatContextBlock(fields: Record<string, unknown>): string {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`);

  return lines.length > 0 ? lines.join("\n") : "(no data available)";
}

export interface PromptResult {
  system: string;
  user: string;
}

export function buildMessages(prompt: PromptResult): AIProviderMessage[] {
  return [
    { role: "system", text: `${IDENTITY_RULES}\n\n${getCurrentDateContext()}\n\n${prompt.system}` },
    { role: "user", text: prompt.user },
  ];
}

/** Convenience re-export so prompt template files don't need to import UserContext separately. */
export type { UserContext };
