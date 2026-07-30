import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findOrCreateInProgressAttempt } from "@/lib/practiceAttempts";
import type { PracticeAttemptSession, PracticeQuestionPublic } from "@/types/practice";

export const dynamic = "force-dynamic";

async function loadPublicQuestions(questionIds: string[]) {
  const { data: rows } = await supabaseAdmin
    .from("practice_questions")
    .select("id, question, question_type, options")
    .in("id", questionIds);

  const byId = new Map((rows ?? []).map((q) => [q.id, q]));

  const questions: PracticeQuestionPublic[] = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.question_type,
      options: q.options,
    }));

  return questions;
}

export async function POST(
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
      .select("id, is_available")
      .eq("slug", testSlug)
      .maybeSingle();

    if (!test) {
      return Response.json(
        { success: false, message: "Mock test not found." },
        { status: 404 }
      );
    }

    if (!test.is_available) {
      return Response.json(
        { success: false, message: "This mock test is not available yet." },
        { status: 403 }
      );
    }

    const attempt = await findOrCreateInProgressAttempt(
      supabase,
      "mock_test_attempts",
      "mock_test_id",
      user.id,
      test.id,
      async () => {
        const { data: linkRows } = await supabaseAdmin
          .from("mock_test_questions")
          .select("question_id")
          .eq("mock_test_id", test.id)
          .order("sort_order");

        if (!linkRows || linkRows.length === 0) {
          throw new Error("This mock test has no questions yet.");
        }

        return linkRows.map((l) => l.question_id);
      }
    );

    const questions = await loadPublicQuestions(attempt.question_ids as string[]);

    const session: PracticeAttemptSession = {
      attemptId: attempt.id,
      status: "in_progress",
      questions,
      answers: (attempt.answers as Record<string, string[]>) ?? {},
      startedAt: attempt.started_at,
    };

    return Response.json({ success: true, session });
  } catch (error) {
    console.error("Mock test attempt start error:", error);

    return Response.json(
      { success: false, message: "Failed to start mock test." },
      { status: 500 }
    );
  }
}
