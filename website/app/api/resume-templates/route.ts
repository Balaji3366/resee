import { getServerSupabase } from "@/lib/supabaseServer";
import type { ResumeTemplateSummary } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("resume_templates")
      .select("id, slug, name, description, thumbnail_url, is_available, sort_order")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const templates: ResumeTemplateSummary[] = (data ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      thumbnailUrl: t.thumbnail_url,
      isAvailable: t.is_available,
    }));

    return Response.json({ success: true, templates });
  } catch (error) {
    console.error("Resume templates error:", error);

    return Response.json(
      { success: false, message: "Failed to load templates." },
      { status: 500 }
    );
  }
}
