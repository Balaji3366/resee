import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildResumeRewritePrompt } from "@/lib/ai/prompts/resumeRewrite";
import { runAIRequest } from "@/lib/ai/requestManager";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { resumeContentToText } from "@/lib/resumeContentSerializer";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import type { ResumeRewriteResult } from "@/lib/ai/prompts/resumeRewrite";
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

    const flags = await getFeatureFlags();
    if (!flags.aiResumeRewrite) {
      return Response.json(
        { success: false, message: "AI resume rewrite is not currently enabled." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const targetRole: string | undefined = body?.targetRole;

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
    const context = await buildUserContext(user.id);
    const prompt = buildResumeRewritePrompt(context, {
      resumeText: resumeContentToText(content),
      targetRole,
    });

    const result = await runAIRequest<ResumeRewriteResult>({
      userId: user.id,
      feature: "resume_rewrite",
      context,
      prompt,
      params: { resumeId: id, targetRole },
      creditCost: 2,
      cacheTtlSeconds: 0,
    });

    if (result.success) {
      await supabase.from("resume_analyses").insert({
        resume_id: id,
        user_id: user.id,
        feature: "resume_rewrite",
        result: result.data,
      });
    }

    return Response.json(result, {
      status: result.success ? 200 : aiErrorStatus(result.error.code),
    });
  } catch (error) {
    console.error("Resume rewrite error:", error);

    return Response.json({ success: false, message: "Failed to rewrite resume." }, { status: 500 });
  }
}
