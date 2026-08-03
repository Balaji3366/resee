import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildResumeVersionComparisonPrompt } from "@/lib/ai/prompts/resumeVersionComparison";
import { runAIRequest } from "@/lib/ai/requestManager";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { resumeContentToText } from "@/lib/resumeContentSerializer";
import { diffResumeVersions } from "@/lib/resumeVersionDiff";
import type { ResumeVersionComparisonResult } from "@/lib/ai/prompts/resumeVersionComparison";
import type { ResumeContent } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

/**
 * Hybrid endpoint, deliberately not a pure AIResponse<T> feature route:
 * the structural diff is always computed for free (no AI, no credit
 * cost) and returned; an AI-written narrative summary on top of it is
 * optional and only generated (and only costs a credit) when the caller
 * explicitly asks for it via includeAiSummary — mirroring the same
 * rule-based-baseline-plus-optional-AI-layer pattern used for
 * Learning/Daily Recommendations.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const versionAId: string | undefined = body?.versionAId;
    const versionBId: string | undefined = body?.versionBId;
    const includeAiSummary: boolean = Boolean(body?.includeAiSummary);

    if (!versionAId || !versionBId) {
      return Response.json(
        { success: false, message: "versionAId and versionBId are required." },
        { status: 400 }
      );
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (resumeError) throw resumeError;
    if (!resume) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    const { data: versions, error: versionsError } = await supabase
      .from("resume_versions")
      .select("id, content, version_number, created_at")
      .eq("resume_id", id)
      .in("id", [versionAId, versionBId]);

    if (versionsError) throw versionsError;

    const versionA = versions?.find((v) => v.id === versionAId);
    const versionB = versions?.find((v) => v.id === versionBId);

    if (!versionA || !versionB) {
      return Response.json(
        { success: false, message: "One or both versions were not found." },
        { status: 404 }
      );
    }

    // Always compare in chronological order regardless of selection order.
    const [before, after] =
      versionA.version_number <= versionB.version_number
        ? [versionA, versionB]
        : [versionB, versionA];

    const diff = diffResumeVersions(
      before.content as ResumeContent,
      after.content as ResumeContent
    );

    let aiSummary: ResumeVersionComparisonResult | null = null;

    if (includeAiSummary && diff.hasChanges) {
      const flags = await getFeatureFlags();
      if (!flags.aiResumeAnalysis) {
        return Response.json(
          { success: false, message: "AI resume analysis is not currently enabled." },
          { status: 403 }
        );
      }

      const context = await buildUserContext(user.id);
      const prompt = buildResumeVersionComparisonPrompt(context, {
        beforeText: resumeContentToText(before.content as ResumeContent),
        afterText: resumeContentToText(after.content as ResumeContent),
      });

      const result = await runAIRequest<ResumeVersionComparisonResult>({
        userId: user.id,
        feature: "resume_version_comparison",
        context,
        prompt,
        params: { resumeId: id, beforeVersionId: before.id, afterVersionId: after.id },
        creditCost: 1,
        // Two specific historical version snapshots never change, so this
        // is safe to cache for a long time.
        cacheTtlSeconds: 60 * 60 * 24 * 30,
      });

      if (!result.success) {
        return Response.json(
          { success: false, message: result.error.message },
          { status: aiErrorStatus(result.error.code) }
        );
      }

      aiSummary = result.data;

      await supabase.from("resume_analyses").insert({
        resume_id: id,
        user_id: user.id,
        feature: "resume_version_comparison",
        result: aiSummary,
      });
    }

    return Response.json({
      success: true,
      diff,
      beforeVersionNumber: before.version_number,
      afterVersionNumber: after.version_number,
      aiSummary,
    });
  } catch (error) {
    console.error("Resume version comparison error:", error);

    return Response.json(
      { success: false, message: "Failed to compare resume versions." },
      { status: 500 }
    );
  }
}
