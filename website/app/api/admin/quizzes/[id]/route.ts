import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

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

    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.passingScore === "number") updates.passing_score = body.passingScore;
    if (typeof body.estimatedMinutes === "number") updates.estimated_minutes = body.estimatedMinutes;

    const { error } = await supabaseAdmin.from("quizzes").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin quiz update error:", error);

    return Response.json({ success: false, message: "Failed to update quiz." }, { status: 500 });
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

    const { error } = await supabaseAdmin.from("quizzes").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin quiz delete error:", error);

    return Response.json({ success: false, message: "Failed to delete quiz." }, { status: 500 });
  }
}
