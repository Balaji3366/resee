import { getServerSupabase } from "@/lib/supabaseServer";
import type { InterviewAnswerReview, InterviewHistoryDetail } from "@/types/interview";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: attempt } = await supabase
      .from("interview_attempts")
      .select("id, status, question_ids, answers, time_taken_seconds, completed_at, set:interview_sets(title)")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!attempt || attempt.status !== "completed") {
      return Response.json({ success: false, message: "Attempt not found." }, { status: 404 });
    }

    const questionIds = attempt.question_ids as string[];
    const answers = (attempt.answers as Record<string, string>) ?? {};

    const { data: questionRows } = await supabase
      .from("interview_questions")
      .select("id, question, question_type, sort_order")
      .in("id", questionIds);

    const byId = new Map((questionRows ?? []).map((q) => [q.id, q]));

    const reviewAnswers: InterviewAnswerReview[] = questionIds
      .map((id) => byId.get(id))
      .filter((q): q is NonNullable<typeof q> => !!q)
      .map((q) => ({
        questionId: q.id,
        question: q.question,
        questionType: q.question_type,
        sortOrder: q.sort_order,
        answer: answers[q.id] ?? "",
      }));

    const set = attempt.set as unknown as { title: string } | null;

    const detail: InterviewHistoryDetail = {
      id: attempt.id,
      title: set?.title ?? "",
      completedAt: attempt.completed_at ?? "",
      timeTakenSeconds: attempt.time_taken_seconds ?? 0,
      answers: reviewAnswers,
    };

    return Response.json({ success: true, detail });
  } catch (error) {
    console.error("Interview history review error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview review." },
      { status: 500 }
    );
  }
}
