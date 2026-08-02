import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.slug === "string") updates.slug = body.slug;
    if (typeof body.name === "string") updates.name = body.name;
    if (typeof body.icon === "string") updates.icon = body.icon;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.sortOrder === "number") updates.sort_order = body.sortOrder;
    if (typeof body.isAvailable === "boolean") updates.is_available = body.isAvailable;

    const { error } = await supabaseAdmin.from("interview_categories").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin interview category update error:", error);

    return Response.json(
      { success: false, message: "Failed to update interview category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest(["super_admin", "admin"]);
    if (auth.error) return auth.error;

    const { count } = await supabaseAdmin
      .from("interview_sets")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if ((count ?? 0) > 0) {
      return Response.json(
        {
          success: false,
          message: "This category is used by one or more interview sets. Re-assign them first.",
        },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin.from("interview_categories").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin interview category delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete interview category." },
      { status: 500 }
    );
  }
}
