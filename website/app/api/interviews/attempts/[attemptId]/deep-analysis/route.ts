import { getServerSupabase } from "@/lib/supabaseServer";
import { buildUserContext } from "@/lib/ai/userContext";
import { buildInterviewFeedbackPrompt } from "@/lib/ai/prompts/interviewFeedback";
import { runAIRequest } from "@/lib/ai/requestManager";
import { aiErrorStatus } from "@/lib/ai/errorHandler";
import { getFeatureFlags } from "@/lib/ai/featureFlags";
import type { InterviewFeedbackResult } from "@/lib/ai/prompts/interviewFeedback";

export const dynamic = "force-dynamic";

/**
 * Optional, per-question drill-down (Decision 5) — 1 credit per
 * question, on top of the automatic whole-session evaluation. Reuses
 * lib/ai/prompts/interviewFeedback.ts exactly as it already existed
 * (unchanged); never touches interview_attempts.answers.
 */
export async function POST(
  request: Request,
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

    const flags = await getFeatureFlags();
    if (!flags.aiInterviewEvaluation) {
      return Response.json(
        { success: false, message: "AI interview evaluation is not currently enabled." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const questionId: string | undefined = body?.questionId;

    if (!questionId) {
      return Response.json({ success: false, message: "questionId is required." }, { status: 400 });
    }

    const { data: attempt } = await supabase
      .from("interview_attempts")
      .select("id, status, answers, set:interview_sets(role:interview_roles(name))")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!attempt || attempt.status !== "completed") {
      return Response.json(
        { success: false, message: "Interview attempt not found." },
        { status: 404 }
      );
    }

    const { data: question } = await supabase
      .from("interview_questions")
      .select("id, question")
      .eq("id", questionId)
      .maybeSingle();

    if (!question) {
      return Response.json({ success: false, message: "Question not found." }, { status: 404 });
    }

    const answers = (attempt.answers as Record<string, string>) ?? {};
    const answer = answers[questionId]?.trim() ?? "";

    if (!answer) {
      return Response.json(
        { success: false, message: "This question has no answer to analyze." },
        { status: 400 }
      );
    }

    const roleTitle =
      (attempt.set as unknown as { role: { name: string } | null } | null)?.role?.name ??
      "this role";

    const context = await buildUserContext(user.id);
    const prompt = buildInterviewFeedbackPrompt(context, {
      question: question.question,
      answer,
      roleTitle,
    });

    const result = await runAIRequest<InterviewFeedbackResult>({
      userId: user.id,
      feature: "interview_deep_analysis",
      context,
      prompt,
      params: { attemptId, questionId },
      creditCost: 1,
      cacheTtlSeconds: 0,
    });

    if (result.success) {
      await supabase.from("interview_analyses").insert({
        attempt_id: attemptId,
        user_id: user.id,
        question_id: questionId,
        feature: "interview_deep_analysis",
        result: result.data,
      });
    }

    return Response.json(result, {
      status: result.success ? 200 : aiErrorStatus(result.error.code),
    });
  } catch (error) {
    console.error("Interview deep analysis error:", error);

    return Response.json(
      { success: false, message: "Failed to analyze this answer." },
      { status: 500 }
    );
  }
}
