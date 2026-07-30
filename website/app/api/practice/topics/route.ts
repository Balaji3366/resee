import { getServerSupabase } from "@/lib/supabaseServer";
import type { PracticeCategory, PracticeTopicSummary } from "@/types/practice";

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

    const { data: categories } = await supabase
      .from("practice_categories")
      .select("id, slug, name, icon")
      .order("sort_order");

    const { data: topics, error: topicsError } = await supabase
      .from("practice_topics")
      .select(
        `
        id, slug, title, description, difficulty, icon, is_available, estimated_minutes,
        category:practice_categories(id, slug, name, icon),
        practice_questions(id)
      `
      )
      .order("sort_order");

    if (topicsError) throw topicsError;

    const topicIds = (topics ?? []).map((t) => t.id);

    const { data: attempts } = topicIds.length
      ? await supabase
          .from("practice_attempts")
          .select("id, topic_id, status, score")
          .eq("user_id", user.id)
          .in("topic_id", topicIds)
      : { data: [] };

    const bestScoreByTopic = new Map<string, number>();
    const attemptsCountByTopic = new Map<string, number>();
    const inProgressByTopic = new Map<string, string>();

    for (const attempt of attempts ?? []) {
      if (attempt.status === "completed") {
        attemptsCountByTopic.set(
          attempt.topic_id,
          (attemptsCountByTopic.get(attempt.topic_id) ?? 0) + 1
        );

        if (typeof attempt.score === "number") {
          bestScoreByTopic.set(
            attempt.topic_id,
            Math.max(bestScoreByTopic.get(attempt.topic_id) ?? 0, attempt.score)
          );
        }
      } else if (attempt.status === "in_progress") {
        inProgressByTopic.set(attempt.topic_id, attempt.id);
      }
    }

    const summaries: PracticeTopicSummary[] = (topics ?? []).map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty,
      icon: topic.icon,
      isAvailable: topic.is_available,
      category: (topic.category as unknown as PracticeCategory) ?? null,
      questionCount: (topic.practice_questions ?? []).length,
      estimatedMinutes: topic.estimated_minutes,
      bestScore: bestScoreByTopic.get(topic.id) ?? null,
      attemptsCount: attemptsCountByTopic.get(topic.id) ?? 0,
      inProgressAttemptId: inProgressByTopic.get(topic.id) ?? null,
    }));

    return Response.json({
      success: true,
      categories: (categories ?? []) as PracticeCategory[],
      topics: summaries,
    });
  } catch (error) {
    console.error("Practice catalog error:", error);

    return Response.json(
      { success: false, message: "Failed to load practice catalog." },
      { status: 500 }
    );
  }
}
