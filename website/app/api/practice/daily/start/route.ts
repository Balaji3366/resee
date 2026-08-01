import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateDailyChallenge, findOrCreateDailyAttempt } from "@/lib/dailyChallenge";
import type { PracticeAttemptSession, PracticeQuestionPublic } from "@/types/practice";

export const dynamic = "force-dynamic";

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export async function POST() {
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

    const attempt = await findOrCreateDailyAttempt(
      supabase,
      user.id,
      challengeDate,
      challenge.questionIds
    );

    if (attempt.status === "completed") {
      return Response.json(
        { success: false, message: "You've already completed today's challenge." },
        { status: 400 }
      );
    }

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
    console.error("Daily challenge start error:", error);

    return Response.json(
      { success: false, message: "Failed to start today's challenge." },
      { status: 500 }
    );
  }
}
