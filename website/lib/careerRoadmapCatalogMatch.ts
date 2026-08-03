import { supabaseAdmin } from "@/lib/supabase-admin";
import type { RoadmapMilestone } from "@/lib/ai/prompts/roadmap";

export interface RoadmapMilestoneWithMatch extends RoadmapMilestone {
  matchedCourseSlug: string | null;
  matchedCourseTitle: string | null;
  courseMatchStatus: "matched" | "not_available";
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isRelated(suggestedSkill: string, candidate: string): boolean {
  const a = normalize(suggestedSkill);
  const b = normalize(candidate);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

/**
 * The deterministic, non-AI second layer of Career Roadmap (Decision
 * 12): the AI (buildRoadmapPrompt) only ever proposes skills/objectives,
 * never a course name — this function is the sole place a real ReSee
 * course gets attached to a milestone, by matching against the actual
 * catalog. A milestone with no match is explicitly labeled
 * "not_available", never silently dropped and never a fabricated slug.
 */
export async function matchMilestonesToCatalog(
  milestones: RoadmapMilestone[]
): Promise<RoadmapMilestoneWithMatch[]> {
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("slug, title, tagline, is_available, course_modules(skill_id, skills(name))")
    .eq("is_available", true);

  const candidates = (courses ?? []).map((course) => {
    const modules = (course.course_modules ?? []) as unknown as {
      skill_id: string | null;
      skills: { name: string } | null;
    }[];
    const skillNames = modules.map((m) => m.skills?.name).filter((n): n is string => Boolean(n));

    return {
      slug: course.slug as string,
      title: course.title as string,
      searchTerms: [course.title as string, course.tagline as string, ...skillNames].filter(
        Boolean
      ),
    };
  });

  return milestones.map((milestone) => {
    for (const suggestedSkill of milestone.suggestedSkills) {
      const match = candidates.find((candidate) =>
        candidate.searchTerms.some((term) => isRelated(suggestedSkill, term))
      );

      if (match) {
        return {
          ...milestone,
          matchedCourseSlug: match.slug,
          matchedCourseTitle: match.title,
          courseMatchStatus: "matched" as const,
        };
      }
    }

    return {
      ...milestone,
      matchedCourseSlug: null,
      matchedCourseTitle: null,
      courseMatchStatus: "not_available" as const,
    };
  });
}
