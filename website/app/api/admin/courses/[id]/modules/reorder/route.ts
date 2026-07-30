import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * course_modules has a unique(course_id, sort_order) constraint, so a
 * naive single-pass reorder can collide mid-update (e.g. swapping two
 * rows' sort_order values momentarily duplicates one). Two phases avoid
 * this: first move every row to a guaranteed-unique negative offset,
 * then assign the final 0..n-1 values.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
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
        .from("course_modules")
        .update({ sort_order: -(i + 1) })
        .eq("id", orderedIds[i])
        .eq("course_id", courseId);

      if (error) throw error;
    }

    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabaseAdmin
        .from("course_modules")
        .update({ sort_order: i })
        .eq("id", orderedIds[i])
        .eq("course_id", courseId);

      if (error) throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin module reorder error:", error);

    return Response.json(
      { success: false, message: "Failed to reorder modules." },
      { status: 500 }
    );
  }
}
