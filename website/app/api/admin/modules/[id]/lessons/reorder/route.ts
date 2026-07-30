import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// lessons has no unique constraint on sort_order, so a simple single-pass
// update is safe here (unlike course_modules' reorder endpoint).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleId } = await params;
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
        .from("lessons")
        .update({ sort_order: i })
        .eq("id", orderedIds[i])
        .eq("module_id", moduleId);

      if (error) throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin lesson reorder error:", error);

    return Response.json(
      { success: false, message: "Failed to reorder lessons." },
      { status: 500 }
    );
  }
}
