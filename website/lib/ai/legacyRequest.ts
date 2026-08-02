import { createHash, randomUUID } from "crypto";
import { getProvider } from "./providers";
import type { AIProviderAttachment, AIProviderMessage } from "./providers/types";
import { normalizeAIError } from "./errorHandler";
import { logAIRequest } from "./logger";
import { checkRateLimit } from "./rateLimiter";
import { getCachedResponse, setCachedResponse } from "./cache";
import { hasCredits, deductCredits } from "./credits";
import { toRedactedParams } from "./security";
import type { AIFeature, AIResponse } from "@/types/ai";

const DEFAULT_MODEL = "gemini-3-flash-preview";

export interface RunLegacyAIRequestOptions {
  userId: string;
  feature: AIFeature;
  messages: AIProviderMessage[];
  attachment?: AIProviderAttachment;
  model?: string;
  /** Raw request params — redacted before ever being logged. Also the
   *  cache-key material when cacheTtlSeconds > 0. */
  params: unknown;
  creditCost?: number;
  /** 0 (default) disables caching — correct for routes whose output must
   *  always reflect the exact submitted input (e.g. a resume rewrite). */
  cacheTtlSeconds?: number;
  /** Stable key identifying this logical request for credit-deduction
   *  idempotency — defaults to a fresh UUID per call, which still
   *  protects against this single execution deducting twice. */
  idempotencyKey?: string;
}

function buildLegacyCacheKey(feature: AIFeature, userId: string, params: unknown): string {
  return createHash("sha256")
    .update(`${feature}:${userId}:${JSON.stringify(params)}`)
    .digest("hex");
}

/**
 * The legacy-route counterpart to requestManager.ts's runAIRequest(). The
 * 8 single-shot legacy AI routes (resume, resume/improve, onboarding,
 * interview, quiz, quiz/file, summarize, pdf-chat) use freeform prompts,
 * not the typed prompt-builder/UserContext machinery runAIRequest()
 * requires — this wrapper reuses the same rate-limit/credit/cache/log
 * infrastructure without forcing those routes into the Phase 1+ feature
 * model. Returns the provider's raw text; JSON parsing (where relevant)
 * stays the caller route's responsibility, since not every legacy route
 * produces JSON.
 */
export async function runLegacyAIRequest(
  options: RunLegacyAIRequestOptions
): Promise<AIResponse<string>> {
  const {
    userId,
    feature,
    messages,
    attachment,
    model,
    params,
    creditCost = 1,
    cacheTtlSeconds = 0,
    idempotencyKey = randomUUID(),
  } = options;
  const paramsRedacted = toRedactedParams(params);
  const loggedModel = model ?? DEFAULT_MODEL;

  const rateLimit = await checkRateLimit(userId, feature);
  if (!rateLimit.allowed) {
    await logAIRequest({
      userId,
      feature,
      provider: "gemini",
      model: loggedModel,
      status: "rate_limited",
      paramsRedacted,
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
      error: {
        code: "no_credits",
        message: "You're out of AI credits for this period.",
        retryable: false,
      },
    };
  }

  const cacheKey = cacheTtlSeconds > 0 ? buildLegacyCacheKey(feature, userId, params) : null;

  if (cacheKey) {
    const cached = await getCachedResponse<string>(cacheKey);
    if (cached !== null) {
      await logAIRequest({
        userId,
        feature,
        provider: "gemini",
        model: loggedModel,
        status: "cached",
        paramsRedacted,
      });
      return { success: true, data: cached, requestId: cacheKey, cached: true };
    }
  }

  const provider = getProvider();
  const startedAt = Date.now();

  try {
    const result = await provider.generate({ messages, attachment, model });
    const latencyMs = Date.now() - startedAt;

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
      paramsRedacted,
    });

    await deductCredits(userId, creditCost, `AI feature: ${feature}`, feature, idempotencyKey);

    if (cacheKey) {
      await setCachedResponse(cacheKey, feature, result.text, cacheTtlSeconds, userId);
    }

    const requestId =
      cacheKey ?? createHash("sha256").update(`${userId}:${feature}:${startedAt}`).digest("hex");

    return { success: true, data: result.text, requestId };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const normalized = normalizeAIError(error);

    await logAIRequest({
      userId,
      feature,
      provider: "gemini",
      model: loggedModel,
      status: normalized.code === "rate_limited" ? "rate_limited" : "error",
      latencyMs,
      errorMessage: normalized.message,
      paramsRedacted,
    });

    return { success: false, error: normalized };
  }
}
