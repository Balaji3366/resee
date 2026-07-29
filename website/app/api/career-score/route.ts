import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { computeCareerScore } from "@/lib/careerScore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Session refresh already happens in proxy.ts for every
            // protected route (including /dashboard), so cookies are
            // already current by the time this route handler runs.
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [profileResult, latestResumeResult, resumeCountResult, historyResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("ai_summary")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("resume_history")
          .select("ats_score")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("resume_history")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("career_score_history")
          .select("overall_score, resume_quality, created_at")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

    const onboardingScore =
      (profileResult.data?.ai_summary as { careerHealthScore?: number } | null)
        ?.careerHealthScore ?? null;

    const result = computeCareerScore({
      latestAtsScore: latestResumeResult.data?.ats_score ?? null,
      resumeCount: resumeCountResult.count ?? 0,
      onboardingScore,
    });

    const historyRows = historyResult.data ?? [];
    const mostRecent = historyRows[0];

    const hasChanged =
      !mostRecent ||
      mostRecent.overall_score !== result.overall ||
      mostRecent.resume_quality !== result.subMetrics.resumeQuality.score;

    if (result.overall !== null && hasChanged) {
      await supabase.from("career_score_history").insert({
        user_id: user.id,
        overall_score: result.overall,
        resume_quality: result.subMetrics.resumeQuality.score,
        technical_skills: result.subMetrics.technicalSkills.score,
        interview_readiness: result.subMetrics.interviewReadiness.score,
        learning_progress: result.subMetrics.learningProgress.score,
        project_portfolio: result.subMetrics.projectPortfolio.score,
        job_readiness: result.subMetrics.jobReadiness.score,
        source: result.overallStatus === "baseline" ? "onboarding_baseline" : "computed",
      });
    }

    const history = (
      hasChanged && result.overall !== null
        ? [
            {
              overall_score: result.overall,
              created_at: new Date().toISOString(),
            },
            ...historyRows,
          ]
        : historyRows
    )
      .slice()
      .reverse()
      .map((row) => ({ date: row.created_at, overall: row.overall_score }));

    return Response.json({
      success: true,
      overall: result.overall,
      overallStatus: result.overallStatus,
      subMetrics: result.subMetrics,
      history,
    });
  } catch (error) {
    console.error("Career score error:", error);

    return Response.json(
      { success: false, message: "Failed to compute career score." },
      { status: 500 }
    );
  }
}
