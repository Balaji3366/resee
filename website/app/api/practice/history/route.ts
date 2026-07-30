import { getServerSupabase } from "@/lib/supabaseServer";
import type { PracticeHistoryEntry } from "@/types/practice";

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
        .select(
          "id, score, correct_count, total_questions, time_taken_seconds, completed_at, topic:practice_topics(slug, title)"
        )
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("mock_test_attempts")
        .select(
          "id, score, correct_count, total_questions, time_taken_seconds, completed_at, mockTest:mock_tests(slug, title)"
        )
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

    const entries: PracticeHistoryEntry[] = [];

    for (const attempt of topicAttempts ?? []) {
      const topic = attempt.topic as unknown as { slug: string; title: string } | null;
      if (!topic || !attempt.completed_at) continue;

      entries.push({
        id: attempt.id,
        kind: "topic",
        title: topic.title,
        slug: topic.slug,
        score: attempt.score ?? 0,
        correctCount: attempt.correct_count ?? 0,
        totalQuestions: attempt.total_questions,
        timeTakenSeconds: attempt.time_taken_seconds ?? 0,
        attemptedAt: attempt.completed_at,
      });
    }

    for (const attempt of mockAttempts ?? []) {
      const mockTest = attempt.mockTest as unknown as { slug: string; title: string } | null;
      if (!mockTest || !attempt.completed_at) continue;

      entries.push({
        id: attempt.id,
        kind: "mock_test",
        title: mockTest.title,
        slug: mockTest.slug,
        score: attempt.score ?? 0,
        correctCount: attempt.correct_count ?? 0,
        totalQuestions: attempt.total_questions,
        timeTakenSeconds: attempt.time_taken_seconds ?? 0,
        attemptedAt: attempt.completed_at,
      });
    }

    entries.sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());

    return Response.json({ success: true, entries });
  } catch (error) {
    console.error("Practice history error:", error);

    return Response.json(
      { success: false, message: "Failed to load practice history." },
      { status: 500 }
    );
  }
}
