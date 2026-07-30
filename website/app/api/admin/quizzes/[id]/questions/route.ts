import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { question, questionType, options, correctOptionIds, explanation, difficulty, marks } =
      body ?? {};

    if (!question || !questionType || !options || !correctOptionIds || !explanation) {
      return Response.json(
        {
          success: false,
          message: "question, questionType, options, correctOptionIds, and explanation are required.",
        },
        { status: 400 }
      );
    }

    const { count } = await supabaseAdmin
      .from("quiz_questions")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", quizId);

    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        question,
        question_type: questionType,
        options,
        correct_option_ids: correctOptionIds,
        explanation,
        difficulty: difficulty ?? null,
        marks: marks ?? 1,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, questionId: data.id });
  } catch (error) {
    console.error("Admin quiz question create error:", error);

    return Response.json(
      { success: false, message: "Failed to create question." },
      { status: 500 }
    );
  }
}
