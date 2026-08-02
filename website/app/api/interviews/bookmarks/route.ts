import { getServerSupabase } from "@/lib/supabaseServer";
import type { BookmarkedInterviewQuestion } from "@/types/interview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: bookmarks } = await supabase
      .from("interview_question_bookmarks")
      .select(
        `
        created_at,
        question:interview_questions(id, question, question_type, interview_set:interview_sets(slug, title))
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    type RawRow = {
      created_at: string;
      question: {
        id: string;
        question: string;
        question_type: "short_text" | "long_text";
        interview_set: { slug: string; title: string } | null;
      } | null;
    };

    const result: BookmarkedInterviewQuestion[] = ((bookmarks ?? []) as unknown as RawRow[])
      .filter((b) => b.question)
      .map((b) => ({
        id: b.question!.id,
        question: b.question!.question,
        questionType: b.question!.question_type,
        setTitle: b.question!.interview_set?.title ?? "",
        setSlug: b.question!.interview_set?.slug ?? "",
        createdAt: b.created_at,
      }));

    return Response.json({ success: true, bookmarks: result });
  } catch (error) {
    console.error("Interview bookmarks list error:", error);

    return Response.json({ success: false, message: "Failed to load bookmarks." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const questionId: string | undefined = body?.questionId;

    if (!questionId) {
      return Response.json({ success: false, message: "questionId is required." }, { status: 400 });
    }

    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("interview_question_bookmarks")
      .upsert({ user_id: user.id, question_id: questionId }, { onConflict: "user_id,question_id" });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Interview bookmark create error:", error);

    return Response.json(
      { success: false, message: "Failed to bookmark question." },
      { status: 500 }
    );
  }
}
