import { checkRateLimit } from "./rateLimiter";
import { hasCredits, deductCredits } from "./credits";
import { validatePromptInput } from "./security";
import { logAIRequest } from "./logger";
import { getFeatureFlags } from "./featureFlags";
import type { AIError, AIFeature } from "@/types/ai";

export type WorkspaceMode = "general" | "career_coach";

/**
 * Maps each AI Workspace mode onto an EXISTING AIFeature slug rather than
 * inventing new ones — this is what actually fixes the shared
 * rate-limit-key bug found during the design sprint
 * (docs/architecture/ai-workspace-architecture.md §7): today both
 * chat routes call checkRateLimit(userId, "legacy_chat_assistant"), so a
 * Career Coach conversation and a General Assistant conversation would
 * compete for the same budget. Giving each mode its own already-existing
 * slug (General keeps the slug it always had; Career Coach reuses
 * "career_coaching", which already exists in types/ai.ts and already has
 * a DB-backed feature flag — aiCareerCoaching, seeded in 0018) gives two
 * genuinely separate budgets with zero new AIFeature values and zero new
 * feature-flag rows.
 */
const WORKSPACE_MODE_FEATURE: Record<WorkspaceMode, AIFeature> = {
  general: "legacy_chat_assistant",
  career_coach: "career_coaching",
};

export function workspaceModeFeature(mode: WorkspaceMode): AIFeature {
  return WORKSPACE_MODE_FEATURE[mode];
}

export interface WorkspaceTurnCheck {
  allowed: boolean;
  feature: AIFeature;
  error?: AIError;
}

/**
 * Pre-flight gate for one AI Workspace turn — reuses the exact same
 * primitives runAIRequest() uses for every other feature
 * (validatePromptInput, getFeatureFlags, checkRateLimit, logAIRequest),
 * in the same order (validate -> flag -> rate-limit), rather than a
 * parallel implementation. General mode never touches the feature-flag
 * check at all (it has no flag and must remain always-on, per Decision 1
 * and the architecture doc §1.5) — only Career Coach mode is gated.
 */
export async function checkWorkspaceTurn(
  userId: string,
  mode: WorkspaceMode,
  message: string
): Promise<WorkspaceTurnCheck> {
  const feature = WORKSPACE_MODE_FEATURE[mode];

  const validation = validatePromptInput(message);
  if (!validation.valid) {
    return {
      allowed: false,
      feature,
      error: { code: "invalid_request", message: validation.reason!, retryable: false },
    };
  }

  if (mode === "career_coach") {
    const flags = await getFeatureFlags();
    if (!flags.aiCareerCoaching) {
      return {
        allowed: false,
        feature,
        error: {
          code: "invalid_request",
          message: "Career Coach mode is not currently enabled.",
          retryable: false,
        },
      };
    }
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
      allowed: false,
      feature,
      error: {
        code: "rate_limited",
        message: `Too many requests. Try again in ${rateLimit.resetInSeconds} seconds.`,
        retryable: true,
      },
    };
  }

  return { allowed: true, feature };
}

/**
 * Session-scoped credit charge for Career Coach mode (Decision 2 — 1
 * credit per session, not per message). Callers must first check
 * chat_sessions.credit_charged_at IS NULL as the cheap fast-path before
 * calling this; the idempotency key below (stable per session) is the
 * actual correctness guarantee against a double charge — e.g. two
 * concurrent "first messages" of the same new session — the same
 * pattern lib/interviewEvaluation.ts already established for
 * whole-session AI evaluations. General mode never calls this at all.
 */
export async function chargeWorkspaceSessionCredit(
  userId: string,
  sessionId: string
): Promise<{ charged: true } | { charged: false; error: AIError }> {
  const enough = await hasCredits(userId, 1);
  if (!enough) {
    return {
      charged: false,
      error: {
        code: "no_credits",
        message: "You're out of AI credits for this period.",
        retryable: false,
      },
    };
  }

  await deductCredits(
    userId,
    1,
    "Career Coach session",
    "career_coaching",
    `career_coach_session:${sessionId}`
  );

  return { charged: true };
}
