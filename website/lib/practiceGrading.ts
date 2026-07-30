import { supabaseAdmin } from "@/lib/supabase-admin";
import { computeStreakUpdate } from "@/lib/learningStreak";
import type { PracticeAttemptQuestionResult, PracticeAttemptResult } from "@/types/practice";

function sameOptionSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

/**
 * Grades a completed attempt against practice_questions via the
 * service-role client — practice_questions has no client-select policy,
 * so correct answers can only ever be read here, server-side.
 */
export async function gradeAttempt(
  questionIds: string[],
  submittedAnswers: Record<string, string[]>,
  timeTakenSeconds: number
): Promise<PracticeAttemptResult> {
  const { data: questions } = await supabaseAdmin
    .from("practice_questions")
    .select("id, correct_option_ids, explanation")
    .in("id", questionIds);

  const byId = new Map((questions ?? []).map((q) => [q.id, q]));

  const results: PracticeAttemptQuestionResult[] = questionIds.map((id) => {
    const q = byId.get(id);
    const correctOptionIds = (q?.correct_option_ids as string[]) ?? [];
    const submitted = submittedAnswers[id] ?? [];

    return {
      questionId: id,
      correct: sameOptionSet(submitted, correctOptionIds),
      correctOptionIds,
      explanation: q?.explanation ?? "",
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const totalQuestions = questionIds.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    score,
    correctCount,
    totalQuestions,
    accuracyPercent: score,
    timeTakenSeconds,
    results,
  };
}

/**
 * Every completed practice/mock-test attempt credits streak + minutes —
 * unlike Learning's quiz_attempts (which only credit on first-ever pass,
 * since that gates module progression), practice has no pass/fail gate,
 * so repeat attempts are expected and each one is real engagement.
 */
export async function creditPracticeEngagement(userId: string, timeTakenSeconds: number) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("current_streak, longest_streak, last_activity_date, total_learning_minutes")
    .eq("id", userId)
    .maybeSingle();

  const streak = computeStreakUpdate({
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    lastActivityDate: profile?.last_activity_date ?? null,
  });

  const minutesEarned = Math.max(1, Math.round(timeTakenSeconds / 60));

  await supabaseAdmin
    .from("profiles")
    .update({
      current_streak: streak.currentStreak,
      longest_streak: streak.longestStreak,
      last_activity_date: streak.lastActivityDate,
      total_learning_minutes: (profile?.total_learning_minutes ?? 0) + minutesEarned,
    })
    .eq("id", userId);
}
