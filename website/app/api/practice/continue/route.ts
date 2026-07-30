import { getServerSupabase } from "@/lib/supabaseServer";
import type { ContinuePracticeItem } from "@/types/practice";

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

    const [{ data: topicAttempts }, { data: mockAttempts }] = await Promise.all([
      supabase
        .from("practice_attempts")
        .select("id, total_questions, answers, started_at, topic:practice_topics(slug, title)")
        .eq("user_id", user.id)
        .eq("status", "in_progress"),
      supabase
        .from("mock_test_attempts")
        .select("id, total_questions, answers, started_at, mockTest:mock_tests(slug, title)")
        .eq("user_id", user.id)
        .eq("status", "in_progress"),
    ]);

    const items: ContinuePracticeItem[] = [];

    for (const attempt of topicAttempts ?? []) {
      const topic = attempt.topic as unknown as { slug: string; title: string } | null;
      if (!topic) continue;

      const answeredCount = Object.keys((attempt.answers as Record<string, string[]>) ?? {}).length;

      items.push({
        attemptId: attempt.id,
        kind: "topic",
        slug: topic.slug,
        title: topic.title,
        totalQuestions: attempt.total_questions,
        questionsRemaining: Math.max(0, attempt.total_questions - answeredCount),
        progressPercent:
          attempt.total_questions > 0
            ? Math.round((answeredCount / attempt.total_questions) * 100)
            : 0,
        startedAt: attempt.started_at,
      });
    }

    for (const attempt of mockAttempts ?? []) {
      const mockTest = attempt.mockTest as unknown as { slug: string; title: string } | null;
      if (!mockTest) continue;

      const answeredCount = Object.keys((attempt.answers as Record<string, string[]>) ?? {}).length;

      items.push({
        attemptId: attempt.id,
        kind: "mock_test",
        slug: mockTest.slug,
        title: mockTest.title,
        totalQuestions: attempt.total_questions,
        questionsRemaining: Math.max(0, attempt.total_questions - answeredCount),
        progressPercent:
          attempt.total_questions > 0
            ? Math.round((answeredCount / attempt.total_questions) * 100)
            : 0,
        startedAt: attempt.started_at,
      });
    }

    items.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return Response.json({ success: true, items });
  } catch (error) {
    console.error("Continue practice error:", error);

    return Response.json(
      { success: false, message: "Failed to load continue-practice data." },
      { status: 500 }
    );
  }
}
