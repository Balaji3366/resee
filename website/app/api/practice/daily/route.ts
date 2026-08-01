import { getServerSupabase } from "@/lib/supabaseServer";
import { getOrCreateDailyChallenge } from "@/lib/dailyChallenge";
import type { DailyChallengeSummary } from "@/types/practice";

export const dynamic = "force-dynamic";

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const challengeDate = todayISODate();
    const challenge = await getOrCreateDailyChallenge(challengeDate);

    if (challenge.questionIds.length === 0) {
      return Response.json(
        { success: false, message: "No practice questions are available yet." },
        { status: 500 }
      );
    }

    const { data: attempt } = await supabase
      .from("daily_challenge_attempts")
      .select("status, score")
      .eq("user_id", user.id)
      .eq("challenge_date", challengeDate)
      .maybeSingle();

    const summary: DailyChallengeSummary = {
      challengeDate,
      totalQuestions: challenge.questionIds.length,
      status: (attempt?.status as "in_progress" | "completed" | undefined) ?? null,
      score: attempt?.score ?? null,
      inProgressAttemptId: null,
    };

    return Response.json({ success: true, challenge: summary });
  } catch (error) {
    console.error("Daily challenge fetch error:", error);

    return Response.json(
      { success: false, message: "Failed to load today's challenge." },
      { status: 500 }
    );
  }
}
