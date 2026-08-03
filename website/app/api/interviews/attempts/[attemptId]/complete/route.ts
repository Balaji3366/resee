import { getServerSupabase } from "@/lib/supabaseServer";
import { creditInterviewEngagement } from "@/lib/interviewEngagement";
import { generatePostSessionEvaluation } from "@/lib/interviewEvaluation";
import type { InterviewAttemptResult } from "@/types/interview";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json().catch(() => ({}));
    const clientTimeTakenSeconds: number | undefined = body?.timeTakenSeconds;

    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: attempt } = await supabase
      .from("interview_attempts")
      .select("id, status, total_questions, answers, started_at")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!attempt) {
      return Response.json({ success: false, message: "Attempt not found." }, { status: 404 });
    }

    if (attempt.status !== "in_progress") {
      return Response.json(
        { success: false, message: "This attempt is already completed." },
        { status: 400 }
      );
    }

    const timeTakenSeconds =
      typeof clientTimeTakenSeconds === "number"
        ? clientTimeTakenSeconds
        : Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000);

    const answers = (attempt.answers as Record<string, string>) ?? {};
    const completedQuestions = Object.values(answers).filter((a) => a.trim().length > 0).length;

    const { error: updateError } = await supabase
      .from("interview_attempts")
      .update({
        status: "completed",
        completed_questions: completedQuestions,
        time_taken_seconds: timeTakenSeconds,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (updateError) throw updateError;

    await creditInterviewEngagement(user.id, timeTakenSeconds);

    // Automatic Post-Session Evaluation (Decision 5) — best-effort and
    // never blocking: a failure here (insufficient credits, flag off, a
    // transient AI error) must never prevent the completion screen from
    // showing the honest record of what the candidate covered. The user
    // can retry it manually via .../evaluate if it doesn't appear.
    try {
      await generatePostSessionEvaluation(supabase, user.id, attemptId);
    } catch (evalError) {
      console.error("Automatic post-session evaluation failed:", evalError);
    }

    const result: InterviewAttemptResult = {
      totalQuestions: attempt.total_questions,
      completedQuestions,
      timeTakenSeconds,
      completionStatus: "completed",
    };

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("Interview attempt complete error:", error);

    return Response.json(
      { success: false, message: "Failed to complete interview session." },
      { status: 500 }
    );
  }
}
