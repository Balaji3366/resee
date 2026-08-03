import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildLearningRecommendationPrompt } from "@/lib/ai/prompts/learningRecommendation";
import { runAIRequest } from "@/lib/ai/requestManager";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import { getRuleBasedLearningRecommendation } from "@/lib/learningRecommendation";
import type { LearningRecommendationResult } from "@/lib/ai/prompts/learningRecommendation";

export const dynamic = "force-dynamic";

/**
 * Rule-based baseline (Decision 10) is always computed and always
 * returned — it never fails and never costs a credit. The AI-enhanced
 * layer is opt-in (body.useAi) and, per Decision 10, ANY failure there
 * (flag disabled, no credits, rate limited, or an AI response that names
 * a course outside the real candidate list) silently falls back to the
 * rule-based result rather than ever surfacing an AI error to the user.
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

    const { recommendation: ruleBased, candidates } = await getRuleBasedLearningRecommendation(
      supabase,
      user.id
    );

    let ai: LearningRecommendationResult | null = null;

    if (useAi && candidates.length > 0) {
      const flags = await getFeatureFlags();

      if (flags.aiLearningRecommendation) {
        const context = await buildUserContext(user.id);
        const prompt = buildLearningRecommendationPrompt(context, { candidates });

        const result = await runAIRequest<LearningRecommendationResult>({
          userId: user.id,
          feature: "learning_recommendation",
          context,
          prompt,
          params: { candidateSlugs: candidates.map((c) => c.slug) },
          creditCost: 1,
          cacheTtlSeconds: 60 * 60 * 24,
        });

        if (
          result.success &&
          candidates.some((c) => c.slug === result.data.recommendedCourseSlug)
        ) {
          ai = result.data;
        }
        // Any other outcome (AI failure, or a slug that isn't a real
        // candidate) intentionally falls through with ai left null —
        // the rule-based recommendation below is never blocked by this.
      }
    }

    return Response.json({ success: true, ruleBased, ai });
  } catch (error) {
    console.error("Learning recommendation error:", error);

    return Response.json(
      { success: false, message: "Failed to load a learning recommendation." },
      { status: 500 }
    );
  }
}
