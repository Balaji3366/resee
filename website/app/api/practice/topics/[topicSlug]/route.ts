import { getServerSupabase } from "@/lib/supabaseServer";
import type { PracticeCategory, PracticeTopicSummary } from "@/types/practice";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ topicSlug: string }> }
) {
  try {
    const { topicSlug } = await params;
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

    const { data: topic } = await supabase
      .from("practice_topics")
      .select(
        `
        id, slug, title, description, difficulty, icon, is_available, estimated_minutes,
        category:practice_categories(id, slug, name, icon),
        practice_questions(id)
      `
      )
      .eq("slug", topicSlug)
      .maybeSingle();

    if (!topic) {
      return Response.json(
        { success: false, message: "Topic not found." },
        { status: 404 }
      );
    }

    const { data: attempts } = await supabase
      .from("practice_attempts")
      .select("id, status, score")
      .eq("user_id", user.id)
      .eq("topic_id", topic.id);

    const completedAttempts = (attempts ?? []).filter((a) => a.status === "completed");
    const inProgress = (attempts ?? []).find((a) => a.status === "in_progress");

    const bestScore = completedAttempts.length
      ? Math.max(...completedAttempts.map((a) => a.score ?? 0))
      : null;

    const summary: PracticeTopicSummary = {
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
      bestScore,
      attemptsCount: completedAttempts.length,
      inProgressAttemptId: inProgress?.id ?? null,
    };

    return Response.json({ success: true, topic: summary });
  } catch (error) {
    console.error("Practice topic detail error:", error);

    return Response.json(
      { success: false, message: "Failed to load topic." },
      { status: 500 }
    );
  }
}
