import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildResumeBulletImprovementPrompt } from "@/lib/ai/prompts/resumeBulletImprovement";
import { runAIRequest } from "@/lib/ai/requestManager";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import type { ResumeBulletImprovementResult } from "@/lib/ai/prompts/resumeBulletImprovement";
import type { ResumeContent } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

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

    // Rides under the same flag as the full rewrite — same capability
    // family (AI improving resume wording), see docs/product/ai-product-specification.md.
    const flags = await getFeatureFlags();
    if (!flags.aiResumeRewrite) {
      return Response.json(
        { success: false, message: "AI resume rewrite is not currently enabled." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const experienceId: string | undefined = body?.experienceId;
    const targetRole: string | undefined = body?.targetRole;

    if (!experienceId) {
      return Response.json(
        { success: false, message: "experienceId is required." },
        { status: 400 }
      );
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, content")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (resumeError) throw resumeError;

    if (!resume) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    const content = resume.content as ResumeContent;
    const experienceItem = content.experience.find((item) => item.id === experienceId);

    if (!experienceItem) {
      return Response.json(
        { success: false, message: "Experience entry not found." },
        { status: 404 }
      );
    }

    if (experienceItem.bullets.length === 0) {
      return Response.json(
        { success: false, message: "This role has no bullet points to improve yet." },
        { status: 400 }
      );
    }

    const context = await buildUserContext(user.id);
    const prompt = buildResumeBulletImprovementPrompt(context, {
      company: experienceItem.company,
      role: experienceItem.role,
      bullets: experienceItem.bullets,
      targetRole,
    });

    const result = await runAIRequest<ResumeBulletImprovementResult>({
      userId: user.id,
      feature: "resume_bullet_improvement",
      context,
      prompt,
      params: { resumeId: id, experienceId, targetRole },
      creditCost: 1,
      cacheTtlSeconds: 0,
    });

    if (result.success) {
      await supabase.from("resume_analyses").insert({
        resume_id: id,
        user_id: user.id,
        feature: "resume_bullet_improvement",
        result: result.data,
      });
    }

    return Response.json(result, {
      status: result.success ? 200 : aiErrorStatus(result.error.code),
    });
  } catch (error) {
    console.error("Resume bullet improvement error:", error);

    return Response.json(
      { success: false, message: "Failed to improve bullet points." },
      { status: 500 }
    );
  }
}
