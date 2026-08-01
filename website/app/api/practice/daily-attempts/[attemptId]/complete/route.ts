import { getServerSupabase } from "@/lib/supabaseServer";
import { gradeAttempt, creditPracticeEngagement } from "@/lib/practiceGrading";

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
      .from("daily_challenge_attempts")
      .select("id, status, question_ids, answers, started_at")
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

    const result = await gradeAttempt(
      attempt.question_ids as string[],
      (attempt.answers as Record<string, string[]>) ?? {},
      timeTakenSeconds
    );

    const { error: updateError } = await supabase
      .from("daily_challenge_attempts")
      .update({
        status: "completed",
        correct_count: result.correctCount,
        score: result.score,
        time_taken_seconds: timeTakenSeconds,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (updateError) throw updateError;

    await creditPracticeEngagement(user.id, timeTakenSeconds);

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("Daily challenge complete error:", error);

    return Response.json(
      { success: false, message: "Failed to complete today's challenge." },
      { status: 500 }
    );
  }
}
