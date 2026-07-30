import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { BookmarkedQuestion } from "@/types/practice";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    const { data: bookmarks } = await supabase
      .from("practice_bookmarks")
      .select("question_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!bookmarks || bookmarks.length === 0) {
      return Response.json({ success: true, bookmarks: [] });
    }

    const questionIds = bookmarks.map((b) => b.question_id);

    const { data: questions } = await supabaseAdmin
      .from("practice_questions")
      .select(
        "id, question, question_type, options, correct_option_ids, explanation, topic:practice_topics(slug, title)"
      )
      .in("id", questionIds);

    const byId = new Map((questions ?? []).map((q) => [q.id, q]));

    const result: BookmarkedQuestion[] = bookmarks
      .map((b) => {
        const q = byId.get(b.question_id);
        if (!q) return null;

        const topic = q.topic as unknown as { slug: string; title: string } | null;

        return {
          id: q.id,
          question: q.question,
          questionType: q.question_type,
          options: q.options,
          correctOptionIds: q.correct_option_ids as string[],
          explanation: q.explanation,
          topicTitle: topic?.title ?? "",
          topicSlug: topic?.slug ?? "",
          createdAt: b.created_at,
        } satisfies BookmarkedQuestion;
      })
      .filter((b): b is BookmarkedQuestion => !!b);

    return Response.json({ success: true, bookmarks: result });
  } catch (error) {
    console.error("Bookmarks list error:", error);

    return Response.json(
      { success: false, message: "Failed to load bookmarks." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const questionId: string | undefined = body?.questionId;

    if (!questionId) {
      return Response.json(
        { success: false, message: "questionId is required." },
        { status: 400 }
      );
    }

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

    const { error } = await supabase
      .from("practice_bookmarks")
      .upsert(
        { user_id: user.id, question_id: questionId },
        { onConflict: "user_id,question_id" }
      );

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Bookmark create error:", error);

    return Response.json(
      { success: false, message: "Failed to bookmark question." },
      { status: 500 }
    );
  }
}
