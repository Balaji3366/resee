import { getServerSupabase } from "@/lib/supabaseServer";
import type { InterviewCategory } from "@/types/interview";

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
      .from("interview_categories")
      .select("id, slug, name, icon, description, is_available")
      .order("sort_order");

    if (error) throw error;

    const categories: InterviewCategory[] = (data ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      description: c.description,
      isAvailable: c.is_available,
    }));

    return Response.json({ success: true, categories });
  } catch (error) {
    console.error("Interview categories error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview categories." },
      { status: 500 }
    );
  }
}
