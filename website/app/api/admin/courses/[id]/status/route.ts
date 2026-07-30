import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["draft", "published", "archived"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const status: string = body?.status;

    if (!VALID_STATUSES.includes(status)) {
      return Response.json(
        { success: false, message: "status must be draft, published, or archived." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("courses")
      .update({
        status,
        is_available: status === "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true, status });
  } catch (error) {
    console.error("Admin course status update error:", error);

    return Response.json(
      { success: false, message: "Failed to update status." },
      { status: 500 }
    );
  }
}
