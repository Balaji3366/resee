import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildResumeAnalysisPrompt } from "@/lib/ai/prompts/resumeAnalysis";
import { runAIRequest } from "@/lib/ai/requestManager";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { resumeContentToText } from "@/lib/resumeContentSerializer";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import type { ResumeAnalysisResult } from "@/lib/ai/prompts/resumeAnalysis";
import type { ResumeContent } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    if (!flags.aiResumeAnalysis) {
      return Response.json(
        { success: false, message: "AI resume analysis is not currently enabled." },
        { status: 403 }
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
    const context = await buildUserContext(user.id);
    const prompt = buildResumeAnalysisPrompt(context, { resumeText: resumeContentToText(content) });

    const result = await runAIRequest<ResumeAnalysisResult>({
      userId: user.id,
      feature: "resume_analysis",
      context,
      prompt,
      params: { resumeId: id, resumeContentLength: JSON.stringify(content).length },
      creditCost: 1,
      cacheTtlSeconds: 3600,
    });

    if (result.success && !result.cached) {
      await supabase.from("resume_analyses").insert({
        resume_id: id,
        user_id: user.id,
        feature: "resume_analysis",
        result: result.data,
      });
    }

    return Response.json(result, {
      status: result.success ? 200 : aiErrorStatus(result.error.code),
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return Response.json({ success: false, message: "Failed to analyze resume." }, { status: 500 });
  }
}
