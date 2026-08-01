import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// practice_questions has no unique constraint on sort_order, so a simple
// single-pass update is safe here — same reasoning as the lessons
// reorder endpoint.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const orderedIds: string[] = body?.orderedIds ?? [];

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return Response.json(
        { success: false, message: "orderedIds must be a non-empty array." },
        { status: 400 }
      );
    }

    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabaseAdmin
        .from("practice_questions")
        .update({ sort_order: i })
        .eq("id", orderedIds[i])
        .eq("topic_id", topicId);

      if (error) throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin practice question reorder error:", error);

    return Response.json(
      { success: false, message: "Failed to reorder questions." },
      { status: 500 }
    );
  }
}
