import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const { linkId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { error } = await supabaseAdmin.from("mock_test_questions").delete().eq("id", linkId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin mock test question unassign error:", error);

    return Response.json(
      { success: false, message: "Failed to remove question from test." },
      { status: 500 }
    );
  }
}
