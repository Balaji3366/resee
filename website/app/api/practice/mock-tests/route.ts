import { getServerSupabase } from "@/lib/supabaseServer";
import type { MockTestSummary } from "@/types/practice";

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

    const { data: tests, error: testsError } = await supabase
      .from("mock_tests")
      .select(
        `
        id, slug, title, description, difficulty, duration_minutes, is_available,
        mock_test_questions(id)
      `
      )
      .order("sort_order");

    if (testsError) throw testsError;

    const testIds = (tests ?? []).map((t) => t.id);

    const { data: attempts } = testIds.length
      ? await supabase
          .from("mock_test_attempts")
          .select("id, mock_test_id, status, score")
          .eq("user_id", user.id)
          .in("mock_test_id", testIds)
      : { data: [] };

    const bestScoreByTest = new Map<string, number>();
    const inProgressByTest = new Map<string, string>();

    for (const attempt of attempts ?? []) {
      if (attempt.status === "completed" && typeof attempt.score === "number") {
        bestScoreByTest.set(
          attempt.mock_test_id,
          Math.max(bestScoreByTest.get(attempt.mock_test_id) ?? 0, attempt.score)
        );
      } else if (attempt.status === "in_progress") {
        inProgressByTest.set(attempt.mock_test_id, attempt.id);
      }
    }

    const summaries: MockTestSummary[] = (tests ?? []).map((test) => ({
      id: test.id,
      slug: test.slug,
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      durationMinutes: test.duration_minutes,
      totalQuestions: (test.mock_test_questions ?? []).length,
      isAvailable: test.is_available,
      bestScore: bestScoreByTest.get(test.id) ?? null,
      inProgressAttemptId: inProgressByTest.get(test.id) ?? null,
    }));

    return Response.json({ success: true, mockTests: summaries });
  } catch (error) {
    console.error("Mock test catalog error:", error);

    return Response.json(
      { success: false, message: "Failed to load mock tests." },
      { status: 500 }
    );
  }
}
