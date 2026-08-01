import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Searches the whole practice_questions bank (across all topics) for
 *  the "add question to mock test" picker — assigning a question here
 *  reuses the existing question, never duplicates its content. */
export async function GET(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    let questionsQuery = supabaseAdmin
      .from("practice_questions")
      .select("id, question, topic:practice_topics(title)")
      .order("sort_order")
      .limit(50);

    if (query) {
      const safeQuery = query.replace(/[,()%_]/g, " ").trim();
      if (safeQuery) {
        questionsQuery = questionsQuery.ilike("question", `%${safeQuery}%`);
      }
    }

    const { data, error } = await questionsQuery;
    if (error) throw error;

    type RawRow = { id: string; question: string; topic: { title: string } | null };

    const questions = ((data ?? []) as unknown as RawRow[]).map((q) => ({
      id: q.id,
      question: q.question,
      topicTitle: q.topic?.title ?? "—",
    }));

    return Response.json({ success: true, questions });
  } catch (error) {
    console.error("Admin mock test question search error:", error);

    return Response.json(
      { success: false, message: "Failed to search questions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: mockTestId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const questionId: string | undefined = body?.questionId;

    if (!questionId) {
      return Response.json({ success: false, message: "questionId is required." }, { status: 400 });
    }

    const { count } = await supabaseAdmin
      .from("mock_test_questions")
      .select("id", { count: "exact", head: true })
      .eq("mock_test_id", mockTestId);

    const { error } = await supabaseAdmin.from("mock_test_questions").insert({
      mock_test_id: mockTestId,
      question_id: questionId,
      sort_order: count ?? 0,
    });

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { success: false, message: "This question is already in the test." },
          { status: 409 }
        );
      }
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin mock test question assign error:", error);

    return Response.json(
      { success: false, message: "Failed to add question to test." },
      { status: 500 }
    );
  }
}
