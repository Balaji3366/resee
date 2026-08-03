import type { SupabaseClient } from "@supabase/supabase-js";
import { getCompletedCourses } from "@/lib/progressAggregation";
import type { LearningRecommendationCandidate } from "@/lib/ai/prompts/learningRecommendation";

export interface RuleBasedLearningRecommendation {
  courseSlug: string;
  courseTitle: string;
  reason: string;
  isContinuing: boolean;
}

/**
 * The always-available, zero-cost baseline Learning Recommendation
 * (Decision 10) — computed entirely from real enrollment/completion
 * data, never an AI call. Also returns the same candidate list the
 * optional AI-enhanced layer (app/api/learning/recommendation/route.ts)
 * uses, so both layers reason over identical real data.
 */
export async function getRuleBasedLearningRecommendation(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  recommendation: RuleBasedLearningRecommendation | null;
  candidates: LearningRecommendationCandidate[];
}> {
  const completed = await getCompletedCourses(supabase, userId);
  const completedIds = new Set(completed.map((c) => c.courseId));

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, sort_order, category:learning_categories(name)")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);
  const enrolledIds = new Set((enrollments ?? []).map((e) => e.course_id));

  const notCompleted = (courses ?? []).filter((c) => !completedIds.has(c.id));

  const candidates: LearningRecommendationCandidate[] = notCompleted.map((c) => ({
    slug: c.slug,
    title: c.title,
    category: (c.category as unknown as { name: string } | null)?.name ?? "General",
  }));

  if (notCompleted.length === 0) {
    return { recommendation: null, candidates };
  }

  // Prefer continuing a course already started over starting a fresh one.
  const continuing = notCompleted.find((c) => enrolledIds.has(c.id));
  const pick = continuing ?? notCompleted[0];

  return {
    recommendation: {
      courseSlug: pick.slug,
      courseTitle: pick.title,
      reason: continuing
        ? `Pick up where you left off in ${pick.title}.`
        : `Start ${pick.title} to keep building your skills.`,
      isContinuing: Boolean(continuing),
    },
    candidates,
  };
}
