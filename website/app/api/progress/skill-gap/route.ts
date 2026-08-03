import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildSkillGapPrompt } from "@/lib/ai/prompts/skillGap";
import { runAIRequest } from "@/lib/ai/requestManager";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import type { SkillGapResult } from "@/lib/ai/prompts/skillGap";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const flags = await getFeatureFlags();
    if (!flags.aiSkillGap) {
      return Response.json(
        { success: false, message: "AI skill gap analysis is not currently enabled." },
        { status: 403 }
      );
    }

    const context = await buildUserContext(user.id);

    if (!context.targetCareer) {
      return Response.json(
        { success: false, message: "Set your target career in Settings first." },
        { status: 400 }
      );
    }

    const prompt = buildSkillGapPrompt(context, { targetRole: context.targetCareer });

    const result = await runAIRequest<SkillGapResult>({
      userId: user.id,
      feature: "skill_gap",
      context,
      prompt,
      params: { targetRole: context.targetCareer },
      creditCost: 1,
      cacheTtlSeconds: 60 * 60,
    });

    return Response.json(result, {
      status: result.success ? 200 : aiErrorStatus(result.error.code),
    });
  } catch (error) {
    console.error("Skill gap error:", error);

    return Response.json(
      { success: false, message: "Failed to analyze skill gap." },
      { status: 500 }
    );
  }
}
