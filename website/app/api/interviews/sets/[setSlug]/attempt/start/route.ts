import { getServerSupabase } from "@/lib/supabaseServer";
import { findOrCreateInProgressAttempt } from "@/lib/practiceAttempts";
import type { InterviewAttemptSession, InterviewQuestionPublic } from "@/types/interview";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function loadPublicQuestions(supabase: SupabaseClient, questionIds: string[]) {
  const { data: rows } = await supabase
    .from("interview_questions")
    .select("id, question, question_type, sort_order")
    .in("id", questionIds);

  const byId = new Map((rows ?? []).map((q) => [q.id, q]));

  const questions: InterviewQuestionPublic[] = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.question_type,
      sortOrder: q.sort_order,
    }));

  return questions;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ setSlug: string }> }
) {
  try {
    const { setSlug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: set } = await supabase
      .from("interview_sets")
      .select("id, is_available")
      .eq("slug", setSlug)
      .maybeSingle();

    if (!set) {
      return Response.json({ success: false, message: "Interview set not found." }, { status: 404 });
    }

    if (!set.is_available) {
      return Response.json(
        { success: false, message: "This interview set is not available yet." },
        { status: 403 }
      );
    }

    const attempt = await findOrCreateInProgressAttempt(
      supabase,
      "interview_attempts",
      "interview_set_id",
      user.id,
      set.id,
      async () => {
        const { data: questionRows } = await supabase
          .from("interview_questions")
          .select("id")
          .eq("interview_set_id", set.id)
          .order("sort_order");

        if (!questionRows || questionRows.length === 0) {
          throw new Error("This interview set has no questions yet.");
        }

        return questionRows.map((q) => q.id);
      }
    );

    const questions = await loadPublicQuestions(supabase, attempt.question_ids as string[]);

    const session: InterviewAttemptSession = {
      attemptId: attempt.id,
      status: "in_progress",
      questions,
      answers: (attempt.answers as Record<string, string>) ?? {},
      startedAt: attempt.started_at,
    };

    return Response.json({ success: true, session });
  } catch (error) {
    console.error("Interview attempt start error:", error);

    return Response.json(
      { success: false, message: "Failed to start interview session." },
      { status: 500 }
    );
  }
}
