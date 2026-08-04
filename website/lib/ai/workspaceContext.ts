import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrRefreshMemory } from "./memory";
import { buildUserContext } from "./userContext";
import type { UserContext } from "@/types/ai";

export interface WorkspaceIntelligenceDigest {
  latestResumeAnalysis?: { atsScore: number; createdAt: string };
  latestInterviewEvaluation?: { overallScore: number; createdAt: string };
}

export interface WorkspaceContext {
  userContext: UserContext;
  intelligence: WorkspaceIntelligenceDigest;
}

/**
 * Career Coach mode's grounding context — General mode never calls this
 * at all (it has no context grounding today and this design doesn't add
 * any, per the architecture doc's "preserve existing General Assistant
 * behaviour" requirement).
 *
 * Reuses getOrRefreshMemory()'s existing 24h-stale cache rather than
 * calling buildUserContext() directly on every turn — this is that
 * function's first real caller anywhere in the app. A multi-turn
 * conversation would otherwise re-run buildUserContext()'s 10+ table
 * fan-out on every single message; with this, only the first stale turn
 * pays that cost.
 *
 * Additively enriches that snapshot with the latest already-generated
 * Resume Intelligence / Interview Intelligence result (if any) — real
 * data that already exists at zero extra AI cost, not a live call into
 * those features. Career Intelligence and Learning Intelligence have no
 * dedicated per-user history table (confirmed during the design sprint's
 * audit), so their contribution to this context is limited to whatever
 * UserContext itself already carries (skills/learning/practice stats) —
 * an accurate integration boundary given the current data model, not an
 * oversight.
 */
export async function buildWorkspaceContext(userId: string): Promise<WorkspaceContext> {
  const memory = await getOrRefreshMemory(userId);
  const userContext = memory.contextSnapshot ?? (await buildUserContext(userId));

  const [{ data: resumeAnalysis }, { data: interviewEvaluation }] = await Promise.all([
    supabaseAdmin
      .from("resume_analyses")
      .select("result, created_at")
      .eq("user_id", userId)
      .eq("feature", "resume_analysis")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("interview_analyses")
      .select("result, created_at")
      .eq("user_id", userId)
      .eq("feature", "interview_evaluation")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const intelligence: WorkspaceIntelligenceDigest = {
    latestResumeAnalysis: resumeAnalysis
      ? {
          atsScore: (resumeAnalysis.result as { atsScore: number }).atsScore,
          createdAt: resumeAnalysis.created_at,
        }
      : undefined,
    latestInterviewEvaluation: interviewEvaluation
      ? {
          overallScore: (interviewEvaluation.result as { overallScore: number }).overallScore,
          createdAt: interviewEvaluation.created_at,
        }
      : undefined,
  };

  return { userContext, intelligence };
}
