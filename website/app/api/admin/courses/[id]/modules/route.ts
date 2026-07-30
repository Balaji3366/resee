import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { title, description } = body ?? {};

    if (!title) {
      return Response.json({ success: false, message: "title is required." }, { status: 400 });
    }

    const { count } = await supabaseAdmin
      .from("course_modules")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId);

    const { data, error } = await supabaseAdmin
      .from("course_modules")
      .insert({
        course_id: courseId,
        title,
        description: description ?? null,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, moduleId: data.id });
  } catch (error) {
    console.error("Admin module create error:", error);

    return Response.json(
      { success: false, message: "Failed to create module." },
      { status: 500 }
    );
  }
}
