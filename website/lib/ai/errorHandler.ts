import type { AIError, AIErrorCode } from "@/types/ai";

/**
 * Generalizes the 429-handling idiom already proven in
 * app/api/interview/route.ts and app/api/quiz/route.ts (the only 2 of 8
 * existing routes that special-case it) to every feature, plus
 * classifies a few more error shapes those routes never distinguished.
 */
export function normalizeAIError(error: unknown): AIError {
  const status = (error as { status?: number })?.status;
  const message = (error as { message?: string })?.message;

  if (status === 429) {
    return {
      code: "rate_limited",
      message: "AI service is busy right now. Please try again in a minute.",
      retryable: true,
    };
  }

  if (typeof status === "number" && status >= 500) {
    return {
      code: "provider_error",
      message: "AI service is temporarily unavailable. Please try again shortly.",
      retryable: true,
    };
  }

  if (typeof status === "number" && status >= 400) {
    return {
      code: "invalid_request",
      message: message || "The request could not be processed.",
      retryable: false,
    };
  }

  return {
    code: "unknown" as AIErrorCode,
    message: message || "Something went wrong while processing your request.",
    retryable: false,
  };
}
