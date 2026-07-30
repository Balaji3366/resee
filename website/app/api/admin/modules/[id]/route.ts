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
    if (typeof body.description === "string" || body.description === null) {
      updates.description = body.description;
    }

    const { error } = await supabaseAdmin.from("course_modules").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin module update error:", error);

    return Response.json(
      { success: false, message: "Failed to update module." },
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

    const { error } = await supabaseAdmin.from("course_modules").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin module delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete module." },
      { status: 500 }
    );
  }
}
