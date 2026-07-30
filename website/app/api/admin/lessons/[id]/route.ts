import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const FIELD_MAP: Record<string, string> = {
  slug: "slug",
  title: "title",
  content: "content",
  keyTakeaways: "key_takeaways",
  estimatedMinutes: "estimated_minutes",
  videoUrl: "video_url",
  pdfUrl: "pdf_url",
  notes: "notes",
  attachments: "attachments",
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

    const { error } = await supabaseAdmin.from("lessons").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin lesson update error:", error);

    return Response.json(
      { success: false, message: "Failed to update lesson." },
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

    const { error } = await supabaseAdmin.from("lessons").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin lesson delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete lesson." },
      { status: 500 }
    );
  }
}
