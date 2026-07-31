import { createHash } from "crypto";
import { getProvider } from "./providers";
import { buildMessages } from "./promptBuilder";
import type { PromptResult } from "./promptBuilder";
import { safeJsonParse } from "./responseParser";
import { normalizeAIError } from "./errorHandler";
import { logAIRequest } from "./logger";
import { checkRateLimit } from "./rateLimiter";
import { getCachedResponse, setCachedResponse, buildCacheKey } from "./cache";
import { hasCredits, deductCredits } from "./credits";
import { validatePromptInput } from "./security";
import type { AIFeature, AIResponse, UserContext } from "@/types/ai";

export interface RunAIRequestOptions {
  userId: string;
  feature: AIFeature;
  context: UserContext;
  prompt: PromptResult;
  params: unknown;
  creditCost?: number;
  cacheTtlSeconds?: number;
}

function contextHash(context: UserContext): string {
  // Only fields relevant to prompt content, not builtAt (which changes
  // every call and would defeat caching entirely).
  const { userId, careerGoal, targetCareer, skillLevel, skills } = context;
  return createHash("sha256")
    .update(JSON.stringify({ userId, careerGoal, targetCareer, skillLevel, skills }))
    .digest("hex");
}

/**
 * The single entry point every future AI feature route calls — nothing
 * in the running app calls this yet. Orchestrates: input validation →
 * rate limit → credits → cache → provider call → parse → log → deduct.
 */
export async function runAIRequest<T>(options: RunAIRequestOptions): Promise<AIResponse<T>> {
  const { userId, feature, context, prompt, params, creditCost = 1, cacheTtlSeconds = 0 } = options;

  const validation = validatePromptInput(prompt.user);
  if (!validation.valid) {
    return { success: false, error: { code: "invalid_request", message: validation.reason!, retryable: false } };
  }

  const rateLimit = await checkRateLimit(userId, feature);
  if (!rateLimit.allowed) {
    await logAIRequest({
      userId,
      feature,
      provider: "gemini",
      model: "gemini-3-flash-preview",
      status: "rate_limited",
    });
    return {
      success: false,
      error: {
        code: "rate_limited",
        message: `Too many requests. Try again in ${rateLimit.resetInSeconds} seconds.`,
        retryable: true,
      },
    };
  }

  const hasEnoughCredits = await hasCredits(userId, creditCost);
  if (!hasEnoughCredits) {
    return {
      success: false,
      error: { code: "no_credits", message: "You're out of AI credits for this period.", retryable: false },
    };
  }

  const cacheKey =
    cacheTtlSeconds > 0 ? buildCacheKey(feature, contextHash(context), params) : null;

  if (cacheKey) {
    const cached = await getCachedResponse<T>(cacheKey);
    if (cached) {
      await logAIRequest({ userId, feature, provider: "gemini", model: "gemini-3-flash-preview", status: "cached" });
      return { success: true, data: cached, requestId: cacheKey, cached: true };
    }
  }

  const provider = getProvider();
  const startedAt = Date.now();

  try {
    const result = await provider.generate({ messages: buildMessages(prompt) });
    const latencyMs = Date.now() - startedAt;

    const parsed = safeJsonParse<T>(result.text);

    if (!parsed.success) {
      await logAIRequest({
        userId,
        feature,
        provider: provider.name,
        model: result.model,
        status: "error",
        latencyMs,
        errorMessage: parsed.error,
      });
      return { success: false, error: { code: "parse_error", message: parsed.error, retryable: false } };
    }

    await logAIRequest({
      userId,
      feature,
      provider: provider.name,
      model: result.model,
      status: "success",
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      totalTokens: result.totalTokens,
      latencyMs,
    });

    await deductCredits(userId, creditCost, `AI feature: ${feature}`, feature);

    if (cacheKey) {
      await setCachedResponse(cacheKey, feature, parsed.data, cacheTtlSeconds);
    }

    const requestId = cacheKey ?? createHash("sha256").update(`${userId}:${feature}:${startedAt}`).digest("hex");

    return { success: true, data: parsed.data, requestId };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const normalized = normalizeAIError(error);

    await logAIRequest({
      userId,
      feature,
      provider: "gemini",
      model: "gemini-3-flash-preview",
      status: normalized.code === "rate_limited" ? "rate_limited" : "error",
      latencyMs,
      errorMessage: normalized.message,
    });

    return { success: false, error: normalized };
  }
}
