import { getServerSupabase } from "@/lib/supabaseServer";
import type { MockTestSummary } from "@/types/practice";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ testSlug: string }> }
) {
  try {
    const { testSlug } = await params;
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

    const { data: test } = await supabase
      .from("mock_tests")
      .select(
        `
        id, slug, title, description, difficulty, duration_minutes, is_available,
        mock_test_questions(id)
      `
      )
      .eq("slug", testSlug)
      .maybeSingle();

    if (!test) {
      return Response.json(
        { success: false, message: "Mock test not found." },
        { status: 404 }
      );
    }

    const { data: attempts } = await supabase
      .from("mock_test_attempts")
      .select("id, status, score")
      .eq("user_id", user.id)
      .eq("mock_test_id", test.id);

    const completedAttempts = (attempts ?? []).filter((a) => a.status === "completed");
    const inProgress = (attempts ?? []).find((a) => a.status === "in_progress");

    const bestScore = completedAttempts.length
      ? Math.max(...completedAttempts.map((a) => a.score ?? 0))
      : null;

    const summary: MockTestSummary = {
      id: test.id,
      slug: test.slug,
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      durationMinutes: test.duration_minutes,
      totalQuestions: (test.mock_test_questions ?? []).length,
      isAvailable: test.is_available,
      bestScore,
      inProgressAttemptId: inProgress?.id ?? null,
    };

    return Response.json({ success: true, mockTest: summary });
  } catch (error) {
    console.error("Mock test detail error:", error);

    return Response.json(
      { success: false, message: "Failed to load mock test." },
      { status: 500 }
    );
  }
}
