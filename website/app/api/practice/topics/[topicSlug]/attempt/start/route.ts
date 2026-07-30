import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { findOrCreateInProgressAttempt } from "@/lib/practiceAttempts";
import type { PracticeAttemptSession, PracticeQuestionPublic } from "@/types/practice";

export const dynamic = "force-dynamic";

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ topicSlug: string }> }
) {
  try {
    const { topicSlug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: topic } = await supabase
      .from("practice_topics")
      .select("id, is_available")
      .eq("slug", topicSlug)
      .maybeSingle();

    if (!topic) {
      return Response.json(
        { success: false, message: "Topic not found." },
        { status: 404 }
      );
    }

    if (!topic.is_available) {
      return Response.json(
        { success: false, message: "This topic is not available yet." },
        { status: 403 }
      );
    }

    const attempt = await findOrCreateInProgressAttempt(
      supabase,
      "practice_attempts",
      "topic_id",
      user.id,
      topic.id,
      async () => {
        const { data: questionRows } = await supabaseAdmin
          .from("practice_questions")
          .select("id")
          .eq("topic_id", topic.id)
          .order("sort_order");

        if (!questionRows || questionRows.length === 0) {
          throw new Error("This topic has no questions yet.");
        }

        return questionRows.map((q) => q.id);
      }
    );

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
    console.error("Practice attempt start error:", error);

    return Response.json(
      { success: false, message: "Failed to start practice session." },
      { status: 500 }
    );
  }
}
