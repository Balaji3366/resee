import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { question, questionType, options, correctOptionIds, explanation } = body ?? {};

    if (!question || !questionType || !options || !correctOptionIds || !explanation) {
      return Response.json(
        {
          success: false,
          message:
            "question, questionType, options, correctOptionIds, and explanation are required.",
        },
        { status: 400 }
      );
    }

    const { count } = await supabaseAdmin
      .from("practice_questions")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", topicId);

    const { data, error } = await supabaseAdmin
      .from("practice_questions")
      .insert({
        topic_id: topicId,
        question,
        question_type: questionType,
        options,
        correct_option_ids: correctOptionIds,
        explanation,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, questionId: data.id });
  } catch (error) {
    console.error("Admin practice question create error:", error);

    return Response.json({ success: false, message: "Failed to add question." }, { status: 500 });
  }
}
