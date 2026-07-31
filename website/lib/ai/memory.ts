import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildUserContext } from "./userContext";
import type { AIMemorySnapshot } from "@/types/ai";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * A refresh-on-stale CACHE of the User Context Engine's output — not a
 * new source of truth, and definitely not chat history. Everywhere
 * except this function reads the cheap cached row; this is the only
 * place that ever calls the (comparatively expensive) full
 * buildUserContext() aggregation.
 */
export async function getOrRefreshMemory(
  userId: string,
  options: { force?: boolean } = {}
): Promise<AIMemorySnapshot> {
  if (!options.force) {
    const { data } = await supabaseAdmin
      .from("ai_user_memory")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      const age = Date.now() - new Date(data.refreshed_at).getTime();
      if (age < STALE_AFTER_MS) {
        return {
          careerGoal: data.career_goal,
          preferredRole: data.preferred_role,
          skillLevel: data.skill_level,
          learningProgressSummary: data.learning_progress_summary,
          contextSnapshot: data.context_snapshot,
          refreshedAt: data.refreshed_at,
        };
      }
    }
  }

  const context = await buildUserContext(userId);

  const snapshot: AIMemorySnapshot = {
    careerGoal: context.careerGoal,
    preferredRole: context.targetCareer,
    skillLevel: context.skillLevel,
    learningProgressSummary: {
      completedCourseCount: context.learning.completedCourseCount,
      overallCompletionPercent: context.learning.overallCompletionPercent,
      currentStreak: context.learning.currentStreak,
    },
    contextSnapshot: context,
    refreshedAt: new Date().toISOString(),
  };

  await supabaseAdmin.from("ai_user_memory").upsert({
    user_id: userId,
    career_goal: snapshot.careerGoal,
    preferred_role: snapshot.preferredRole,
    skill_level: snapshot.skillLevel,
    learning_progress_summary: snapshot.learningProgressSummary,
    context_snapshot: snapshot.contextSnapshot,
    refreshed_at: snapshot.refreshedAt,
  });

  return snapshot;
}
