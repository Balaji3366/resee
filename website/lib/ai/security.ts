const MAX_INPUT_LENGTH = 20000;

const INJECTION_MARKERS = [
  /ignore (all )?(previous|prior|above) instructions/i,
  /you are now/i,
  /system prompt/i,
  /disregard (all )?(previous|prior) rules/i,
];

export interface PromptValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Screens raw user-supplied text before it's ever interpolated into a
 * prompt — a length guard plus a small set of known prompt-injection
 * phrasings. Not a substitute for careful prompt design, but a real
 * first line of defense rather than a placeholder.
 */
export function validatePromptInput(text: string): PromptValidationResult {
  if (!text || !text.trim()) {
    return { valid: false, reason: "Input is empty." };
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return { valid: false, reason: `Input exceeds ${MAX_INPUT_LENGTH} characters.` };
  }

  for (const marker of INJECTION_MARKERS) {
    if (marker.test(text)) {
      return { valid: false, reason: "Input contains a disallowed instruction pattern." };
    }
  }

  return { valid: true };
}

const SENSITIVE_KEYS = ["password", "ssn", "creditCard", "cardNumber", "apiKey", "token"];

/**
 * Strips obviously sensitive fields before an object is persisted to
 * ai_requests/ai_response_cache — logging must never become a second
 * copy of secrets.
 */
export function redactSensitiveFields<T extends Record<string, unknown>>(obj: T): T {
  const redacted = { ...obj };

  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      (redacted as Record<string, unknown>)[key] = "[REDACTED]";
    }
  }

  return redacted;
}

/** Shared by requestManager.ts and legacyRequest.ts — params must never
 *  reach ai_requests unredacted. Non-object params (or none) log as null
 *  rather than attempting to redact a primitive. */
export function toRedactedParams(params: unknown): Record<string, unknown> | null {
  if (params && typeof params === "object" && !Array.isArray(params)) {
    return redactSensitiveFields(params as Record<string, unknown>);
  }
  return null;
}
