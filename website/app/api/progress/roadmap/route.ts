import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildRoadmapPrompt } from "@/lib/ai/prompts/roadmap";
import { runAIRequest } from "@/lib/ai/requestManager";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import { matchMilestonesToCatalog } from "@/lib/careerRoadmapCatalogMatch";
import type { RoadmapResult } from "@/lib/ai/prompts/roadmap";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const flags = await getFeatureFlags();
    if (!flags.aiCareerRoadmap) {
      return Response.json(
        { success: false, message: "AI career roadmap is not currently enabled." },
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

    const body = await request.json().catch(() => ({}));
    const timeframeMonths: number | undefined = body?.timeframeMonths;

    const prompt = buildRoadmapPrompt(context, {
      targetRole: context.targetCareer,
      timeframeMonths,
    });

    const result = await runAIRequest<RoadmapResult>({
      userId: user.id,
      feature: "career_roadmap",
      context,
      prompt,
      params: { targetRole: context.targetCareer, timeframeMonths },
      creditCost: 3,
      cacheTtlSeconds: 60 * 60 * 6,
    });

    if (!result.success) {
      return Response.json(result, { status: aiErrorStatus(result.error.code) });
    }

    // Layer 2: deterministic, free, non-AI catalog mapping — the AI never
    // names a course itself (see lib/ai/prompts/roadmap.ts).
    const milestones = await matchMilestonesToCatalog(result.data.milestones);

    return Response.json({ success: true, data: { milestones }, requestId: result.requestId });
  } catch (error) {
    console.error("Career roadmap error:", error);

    return Response.json(
      { success: false, message: "Failed to generate career roadmap." },
      { status: 500 }
    );
  }
}
