export type ParseResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Normalizes the two different levels of defensiveness found across
 * existing routes (some strip ```json fences before parsing, some
 * JSON.parse raw text and fail on any fence) into one implementation.
 */
export function safeJsonParse<T>(rawText: string): ParseResult<T> {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  if (!cleaned) {
    return { success: false, error: "Empty response from AI provider." };
  }

  try {
    return { success: true, data: JSON.parse(cleaned) as T };
  } catch {
    return { success: false, error: "AI response was not valid JSON." };
  }
}
