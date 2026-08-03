import type { SupabaseClient } from "@supabase/supabase-js";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildInterviewPostSessionEvaluationPrompt } from "@/lib/ai/prompts/interviewPostSessionEvaluation";
import { runAIRequest } from "@/lib/ai/requestManager";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import type { InterviewPostSessionEvaluationResult } from "@/lib/ai/prompts/interviewPostSessionEvaluation";
import type { AIResponse } from "@/types/ai";

/**
 * Generates the automatic Post-Session Evaluation for one completed
 * interview attempt (Decision 5) — shared by the automatic trigger
 * (interviews/attempts/[attemptId]/complete/route.ts, called right after
 * the existing bookkeeping, its result ignored/never blocking) and the
 * manual retry route (interviews/attempts/[attemptId]/evaluate/route.ts,
 * for when the automatic attempt failed — e.g. insufficient credits at
 * the time — and the user wants to try again once that's resolved).
 *
 * Idempotent: if an evaluation already exists for this attempt, it's
 * returned as-is rather than generating (and charging for) a second one
 * — this is an application-level safeguard on top of the credit
 * system's own idempotency-key protection, preventing a duplicate
 * automatic-plus-manual-retry sequence from ever double-charging.
 *
 * Never reads or writes interview_attempts.answers — the evaluation
 * result lives entirely in the separate interview_analyses table, so
 * the user's original answers are never touched.
 */
export async function generatePostSessionEvaluation(
  supabase: SupabaseClient,
  userId: string,
  attemptId: string
): Promise<AIResponse<InterviewPostSessionEvaluationResult>> {
  const { data: existing } = await supabase
    .from("interview_analyses")
    .select("id, result")
    .eq("attempt_id", attemptId)
    .eq("feature", "interview_evaluation")
    .is("question_id", null)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      data: existing.result as InterviewPostSessionEvaluationResult,
      requestId: existing.id,
      cached: true,
    };
  }

  const { data: attempt } = await supabase
    .from("interview_attempts")
    .select("id, status, question_ids, answers, set:interview_sets(role:interview_roles(name))")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!attempt || attempt.status !== "completed") {
    return {
      success: false,
      error: {
        code: "invalid_request",
        message: "This interview isn't completed yet.",
        retryable: false,
      },
    };
  }

  const flags = await getFeatureFlags();
  if (!flags.aiInterviewEvaluation) {
    return {
      success: false,
      error: {
        code: "invalid_request",
        message: "AI interview evaluation is not currently enabled.",
        retryable: false,
      },
    };
  }

  const questionIds = attempt.question_ids as string[];
  const answers = (attempt.answers as Record<string, string>) ?? {};

  const { data: questionRows } = await supabase
    .from("interview_questions")
    .select("id, question, sort_order")
    .in("id", questionIds)
    .order("sort_order", { ascending: true });

  const roleTitle =
    (attempt.set as unknown as { role: { name: string } | null } | null)?.role?.name ?? "this role";

  const qaPairs = (questionRows ?? []).map((q) => ({
    question: q.question,
    answer: answers[q.id]?.trim() ?? "",
  }));

  const context = await buildUserContext(userId);
  const prompt = buildInterviewPostSessionEvaluationPrompt(context, { roleTitle, qaPairs });

  const result = await runAIRequest<InterviewPostSessionEvaluationResult>({
    userId,
    feature: "interview_evaluation",
    context,
    prompt,
    params: { attemptId, questionCount: qaPairs.length },
    creditCost: 1,
    cacheTtlSeconds: 0,
  });

  if (result.success) {
    const { error: insertError } = await supabase.from("interview_analyses").insert({
      attempt_id: attemptId,
      user_id: userId,
      question_id: null,
      feature: "interview_evaluation",
      result: result.data,
    });

    // The AI call already succeeded and the credit was already deducted —
    // still return that success to the caller. A failure only to persist
    // the history row must not be reported as an evaluation failure, but
    // it must not be silent either (it would otherwise defeat this
    // function's own idempotency check on the next call).
    if (insertError) {
      console.error("Failed to persist interview_analyses row:", insertError);
    }
  }

  return result;
}
