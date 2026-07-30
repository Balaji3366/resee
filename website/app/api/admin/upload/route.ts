import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Reuses the exact "uploads" bucket + upload mechanics from
// app/api/uploads/route.ts, but — unlike that route, which has no auth
// check at all — adds the requireAdmin gate, since this is a
// security-critical subsystem and that gap must not be copied here.
export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ success: false, message: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `admin/${Date.now()}-${file.name}`;

    const { error } = await supabaseAdmin.storage
      .from("uploads")
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("uploads").getPublicUrl(fileName);

    return Response.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Admin upload error:", error);

    return Response.json({ success: false, message: "Failed to upload file." }, { status: 500 });
  }
}
