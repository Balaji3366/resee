import type { SupabaseClient } from "@supabase/supabase-js";

interface AttemptRow {
  id: string;
  status: "in_progress" | "completed";
  question_ids: unknown;
  answers: unknown;
  started_at: string;
}

/**
 * Finds the caller's in-progress attempt for this topic/mock-test, or
 * creates one. The two-step check-then-insert isn't atomic on its own —
 * two near-simultaneous start requests (a double-click, a network retry,
 * or React's dev-mode double effect invocation) can both see "no existing
 * attempt" and both try to insert, so the partial unique index
 * ("one in-progress attempt per topic/test per user") rejects the loser
 * with a 23505 unique-violation. Rather than surfacing that as an error,
 * treat it as "someone else's request already created it" and resume
 * that row instead.
 *
 * `loadQuestionIdsForNewAttempt` is only invoked when a new attempt
 * actually needs to be created — a resumed attempt uses its own stored
 * question_ids snapshot, not a fresh query.
 */
export async function findOrCreateInProgressAttempt(
  supabase: SupabaseClient,
  table: "practice_attempts" | "mock_test_attempts",
  parentIdColumn: "topic_id" | "mock_test_id",
  userId: string,
  parentId: string,
  loadQuestionIdsForNewAttempt: () => Promise<string[]>
): Promise<AttemptRow> {
  const { data: existing } = await supabase
    .from(table)
    .select("id, status, question_ids, answers, started_at")
    .eq("user_id", userId)
    .eq(parentIdColumn, parentId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) return existing;

  const questionIds = await loadQuestionIdsForNewAttempt();

  const { data: created, error: insertError } = await supabase
    .from(table)
    .insert({
      user_id: userId,
      [parentIdColumn]: parentId,
      status: "in_progress",
      question_ids: questionIds,
      answers: {},
      total_questions: questionIds.length,
    })
    .select("id, status, question_ids, answers, started_at")
    .single();

  if (!insertError) return created;

  if (insertError.code === "23505") {
    const { data: raceWinner, error: refetchError } = await supabase
      .from(table)
      .select("id, status, question_ids, answers, started_at")
      .eq("user_id", userId)
      .eq(parentIdColumn, parentId)
      .eq("status", "in_progress")
      .single();

    if (refetchError) throw refetchError;
    return raceWinner;
  }

  throw insertError;
}
