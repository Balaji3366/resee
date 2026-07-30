import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { gradeAttempt } from "@/lib/practiceGrading";
import type { PracticeQuestionPublic } from "@/types/practice";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const kind = new URL(request.url).searchParams.get("kind");

    if (kind !== "topic" && kind !== "mock_test") {
      return Response.json(
        { success: false, message: "A valid kind query param is required." },
        { status: 400 }
      );
    }

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

    const table = kind === "topic" ? "practice_attempts" : "mock_test_attempts";

    const { data: attempt } = await supabase
      .from(table)
      .select("id, status, question_ids, answers, time_taken_seconds")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!attempt || attempt.status !== "completed") {
      return Response.json(
        { success: false, message: "Attempt not found." },
        { status: 404 }
      );
    }

    const questionIds = attempt.question_ids as string[];
    const answers = (attempt.answers as Record<string, string[]>) ?? {};

    const { data: questionRows } = await supabaseAdmin
      .from("practice_questions")
      .select("id, question, question_type, options")
      .in("id", questionIds);

    const byId = new Map((questionRows ?? []).map((q) => [q.id, q]));

    const questions: PracticeQuestionPublic[] = questionIds
      .map((id) => byId.get(id))
      .filter((q): q is NonNullable<typeof q> => !!q)
      .map((q) => ({
        id: q.id,
        question: q.question,
        questionType: q.question_type,
        options: q.options,
      }));

    const result = await gradeAttempt(questionIds, answers, attempt.time_taken_seconds ?? 0);

    return Response.json({ success: true, questions, answers, result });
  } catch (error) {
    console.error("Attempt review error:", error);

    return Response.json(
      { success: false, message: "Failed to load attempt review." },
      { status: 500 }
    );
  }
}
