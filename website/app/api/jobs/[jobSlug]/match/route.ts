import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildJobMatchPrompt } from "@/lib/ai/prompts/jobMatch";
import { runAIRequest } from "@/lib/ai/requestManager";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import type { JobMatchResult } from "@/lib/ai/prompts/jobMatch";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobSlug: string }> }
) {
  try {
    const { jobSlug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const flags = await getFeatureFlags();
    if (!flags.aiJobMatch) {
      return Response.json(
        { success: false, message: "AI job match is not currently enabled." },
        { status: 403 }
      );
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, description, skills")
      .eq("slug", jobSlug)
      .maybeSingle();

    if (!job) {
      return Response.json({ success: false, message: "Job not found." }, { status: 404 });
    }

    const context = await buildUserContext(user.id);
    const prompt = buildJobMatchPrompt(context, {
      jobTitle: job.title,
      jobDescription: job.description,
      jobSkills: job.skills ?? [],
    });

    const result = await runAIRequest<JobMatchResult>({
      userId: user.id,
      feature: "job_match",
      context,
      prompt,
      params: { jobId: job.id },
      creditCost: 1,
      // A job posting's own content is static, so a long TTL means the
      // user (and only the user) is charged once per job, not per view.
      cacheTtlSeconds: 60 * 60 * 24,
    });

    return Response.json(result, {
      status: result.success ? 200 : aiErrorStatus(result.error.code),
    });
  } catch (error) {
    console.error("Job match error:", error);

    return Response.json(
      { success: false, message: "Failed to check job match." },
      { status: 500 }
    );
  }
}
