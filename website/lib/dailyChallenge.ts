import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

const QUESTIONS_PER_CHALLENGE = 10;

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns today's shared question set, generating it on the first
 * request of the day. Every user gets the same set for a given date —
 * generated once via supabaseAdmin (daily_challenges has no
 * client-write policy) and race-safe the same way
 * lib/certificates.ts:issueCertificateIfEligible is: a 23505 on the
 * unique(challenge_date) constraint means someone else's concurrent
 * request already created it, so just re-fetch that row.
 */
export async function getOrCreateDailyChallenge(
  challengeDate: string = todayISODate()
): Promise<{ id: string; questionIds: string[] }> {
  const { data: existing } = await supabaseAdmin
    .from("daily_challenges")
    .select("id, question_ids")
    .eq("challenge_date", challengeDate)
    .maybeSingle();

  if (existing) return { id: existing.id, questionIds: existing.question_ids as string[] };

  const { data: availableTopics } = await supabaseAdmin
    .from("practice_topics")
    .select("id")
    .eq("is_available", true);

  const availableTopicIds = (availableTopics ?? []).map((t) => t.id);

  const { data: availableQuestions } = availableTopicIds.length
    ? await supabaseAdmin.from("practice_questions").select("id").in("topic_id", availableTopicIds)
    : { data: [] };

  const pool = (availableQuestions ?? []).map((q) => q.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const questionIds = shuffled.slice(0, QUESTIONS_PER_CHALLENGE);

  const { data: created, error } = await supabaseAdmin
    .from("daily_challenges")
    .insert({ challenge_date: challengeDate, question_ids: questionIds })
    .select("id, question_ids")
    .single();

  if (!error) return { id: created.id, questionIds: created.question_ids as string[] };

  if (error.code === "23505") {
    const { data: raceWinner, error: refetchError } = await supabaseAdmin
      .from("daily_challenges")
      .select("id, question_ids")
      .eq("challenge_date", challengeDate)
      .single();

    if (refetchError) throw refetchError;
    return { id: raceWinner.id, questionIds: raceWinner.question_ids as string[] };
  }

  throw error;
}

interface DailyAttemptRow {
  id: string;
  status: "in_progress" | "completed";
  question_ids: unknown;
  answers: unknown;
  started_at: string;
  score: number | null;
}

/**
 * Unlike lib/practiceAttempts.ts:findOrCreateInProgressAttempt (which
 * allows a new attempt once a previous one completes), a Daily
 * Challenge is one attempt total per calendar day — the plain
 * unique(user_id, challenge_date) constraint enforces that regardless
 * of status, so a completed row is returned as-is (view results),
 * never superseded by a new one.
 */
export async function findOrCreateDailyAttempt(
  supabase: SupabaseClient,
  userId: string,
  challengeDate: string,
  questionIds: string[]
): Promise<DailyAttemptRow> {
  const { data: existing } = await supabase
    .from("daily_challenge_attempts")
    .select("id, status, question_ids, answers, started_at, score")
    .eq("user_id", userId)
    .eq("challenge_date", challengeDate)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("daily_challenge_attempts")
    .insert({
      user_id: userId,
      challenge_date: challengeDate,
      status: "in_progress",
      question_ids: questionIds,
      answers: {},
      total_questions: questionIds.length,
    })
    .select("id, status, question_ids, answers, started_at, score")
    .single();

  if (!error) return created;

  if (error.code === "23505") {
    const { data: raceWinner, error: refetchError } = await supabase
      .from("daily_challenge_attempts")
      .select("id, status, question_ids, answers, started_at, score")
      .eq("user_id", userId)
      .eq("challenge_date", challengeDate)
      .single();

    if (refetchError) throw refetchError;
    return raceWinner;
  }

  throw error;
}
