import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: moduleId } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, title, content, estimatedMinutes } = body ?? {};

    if (!slug || !title || !content) {
      return Response.json(
        { success: false, message: "slug, title, and content are required." },
        { status: 400 }
      );
    }

    const { data: mod, error: modError } = await supabaseAdmin
      .from("course_modules")
      .select("course_id")
      .eq("id", moduleId)
      .maybeSingle();

    if (modError) throw modError;
    if (!mod) {
      return Response.json({ success: false, message: "Module not found." }, { status: 404 });
    }

    const { count } = await supabaseAdmin
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("module_id", moduleId);

    const { data, error } = await supabaseAdmin
      .from("lessons")
      .insert({
        module_id: moduleId,
        course_id: mod.course_id,
        slug,
        title,
        content,
        estimated_minutes: estimatedMinutes ?? 5,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, lessonId: data.id });
  } catch (error) {
    console.error("Admin lesson create error:", error);

    return Response.json(
      { success: false, message: "Failed to create lesson." },
      { status: 500 }
    );
  }
}
