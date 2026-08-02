import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: setId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { question, questionType } = body ?? {};

    if (!question || !questionType) {
      return Response.json(
        { success: false, message: "question and questionType are required." },
        { status: 400 }
      );
    }

    const { count } = await supabaseAdmin
      .from("interview_questions")
      .select("id", { count: "exact", head: true })
      .eq("interview_set_id", setId);

    const { data, error } = await supabaseAdmin
      .from("interview_questions")
      .insert({
        interview_set_id: setId,
        question,
        question_type: questionType,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, questionId: data.id });
  } catch (error) {
    console.error("Admin interview question create error:", error);

    return Response.json({ success: false, message: "Failed to add question." }, { status: 500 });
  }
}
