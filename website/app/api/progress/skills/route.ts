import { getServerSupabase } from "@/lib/supabaseServer";
import type { ProgressSkillsData, SkillProgress } from "@/types/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: allSkills } = await supabase
      .from("skills")
      .select("id, slug, name, icon")
      .order("sort_order");

    const { data: linkedTopics } = await supabase
      .from("practice_topics")
      .select("id, skill_id")
      .not("skill_id", "is", null);

    const { data: linkedModules } = await supabase
      .from("course_modules")
      .select("id, skill_id, lessons(id)")
      .not("skill_id", "is", null);

    const topicIds = (linkedTopics ?? []).map((t) => t.id);
    const moduleIds = (linkedModules ?? []).map((m) => m.id);

    const [{ data: topicAttempts }, { data: moduleProgressRows }] = await Promise.all([
      topicIds.length
        ? supabase
            .from("practice_attempts")
            .select("topic_id, correct_count, total_questions")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .in("topic_id", topicIds)
        : Promise.resolve({ data: [] }),
      moduleIds.length
        ? supabase
            .from("module_progress")
            .select("module_id, lessons_completed_count, quiz_passed")
            .eq("user_id", user.id)
            .in("module_id", moduleIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Per-topic accuracy from the user's completed attempts.
    const topicPercentById = new Map<string, number>();
    const topicTotals = new Map<string, { correct: number; total: number }>();

    for (const attempt of topicAttempts ?? []) {
      const totals = topicTotals.get(attempt.topic_id) ?? { correct: 0, total: 0 };
      totals.correct += attempt.correct_count ?? 0;
      totals.total += attempt.total_questions;
      topicTotals.set(attempt.topic_id, totals);
    }

    for (const [topicId, totals] of topicTotals.entries()) {
      topicPercentById.set(
        topicId,
        totals.total > 0 ? Math.round((totals.correct / totals.total) * 100) : 0
      );
    }

    // Per-module percent: lessons-only progress caps at 60%, a passed
    // quiz reaches 100% — a module with no progress row is 0%.
    const modulePercentById = new Map<string, number>();
    const moduleProgressByModuleId = new Map(
      (moduleProgressRows ?? []).map((r) => [r.module_id, r])
    );

    for (const mod of linkedModules ?? []) {
      const totalLessons = (mod.lessons ?? []).length;
      const progress = moduleProgressByModuleId.get(mod.id);

      if (progress?.quiz_passed) {
        modulePercentById.set(mod.id, 100);
      } else if (totalLessons > 0 && progress) {
        modulePercentById.set(
          mod.id,
          Math.round((progress.lessons_completed_count / totalLessons) * 100 * 0.6)
        );
      } else {
        modulePercentById.set(mod.id, 0);
      }
    }

    const skills: SkillProgress[] = (allSkills ?? []).map((skill) => {
      const percents: number[] = [];

      for (const topic of linkedTopics ?? []) {
        if (topic.skill_id === skill.id) {
          percents.push(topicPercentById.get(topic.id) ?? 0);
        }
      }

      for (const mod of linkedModules ?? []) {
        if (mod.skill_id === skill.id) {
          percents.push(modulePercentById.get(mod.id) ?? 0);
        }
      }

      const percent =
        percents.length > 0
          ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length)
          : 0;

      return {
        id: skill.id,
        slug: skill.slug,
        name: skill.name,
        icon: skill.icon,
        percent,
      };
    });

    const withProgress = skills.filter((s) => s.percent > 0).sort((a, b) => b.percent - a.percent);
    const strengths = withProgress.slice(0, 3);

    const areasToImprove = [...skills]
      .filter((s) => !strengths.some((strong) => strong.id === s.id))
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 3);

    const data: ProgressSkillsData = { skills, strengths, areasToImprove };

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Progress skills error:", error);

    return Response.json(
      { success: false, message: "Failed to load skill progress." },
      { status: 500 }
    );
  }
}
