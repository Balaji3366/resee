import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const FIELD_MAP: Record<string, string> = {
  question: "question",
  questionType: "question_type",
  options: "options",
  correctOptionIds: "correct_option_ids",
  explanation: "explanation",
  difficulty: "difficulty",
  marks: "marks",
  timeLimitSeconds: "time_limit_seconds",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    for (const [bodyKey, column] of Object.entries(FIELD_MAP)) {
      if (body[bodyKey] !== undefined) updates[column] = body[bodyKey];
    }

    const { error } = await supabaseAdmin.from("quiz_questions").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin quiz question update error:", error);

    return Response.json(
      { success: false, message: "Failed to update question." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { error } = await supabaseAdmin.from("quiz_questions").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin quiz question delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete question." },
      { status: 500 }
    );
  }
}
