import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import {
  buildDailyRecommendationPrompt,
  isValidDailyRecommendationAction,
} from "@/lib/ai/prompts/dailyRecommendation";
import { runAIRequest } from "@/lib/ai/requestManager";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import { getRuleBasedDailyRecommendation } from "@/lib/dailyRecommendation";
import type { DailyRecommendationResult } from "@/lib/ai/prompts/dailyRecommendation";

export const dynamic = "force-dynamic";

/**
 * Same rule-based-baseline-plus-optional-AI-layer pattern as Learning
 * Recommendation (Decision 10) — the rule-based nudge always succeeds
 * and is free; the AI layer is opt-in and any failure silently falls
 * back to it rather than surfacing an AI error.
 */
export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const useAi: boolean = Boolean(body?.useAi);

    const context = await buildUserContext(user.id);
    const ruleBased = await getRuleBasedDailyRecommendation(supabase, user.id, context);

    let ai: DailyRecommendationResult | null = null;

    if (useAi) {
      const flags = await getFeatureFlags();

      if (flags.aiDailyRecommendation) {
        const prompt = buildDailyRecommendationPrompt(context);

        const result = await runAIRequest<DailyRecommendationResult>({
          userId: user.id,
          feature: "daily_recommendation",
          context,
          prompt,
          params: { day: new Date().toISOString().slice(0, 10) },
          creditCost: 1,
          cacheTtlSeconds: 60 * 60 * 24,
        });

        if (result.success && isValidDailyRecommendationAction(result.data.suggestedAction)) {
          ai = result.data;
        }
      }
    }

    return Response.json({ success: true, ruleBased, ai });
  } catch (error) {
    console.error("Daily recommendation error:", error);

    return Response.json(
      { success: false, message: "Failed to load today's recommendation." },
      { status: 500 }
    );
  }
}
