import { getServerSupabase } from "@/lib/supabaseServer";
import type { AchievementStatus } from "@/types/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [{ data: catalog }, { data: earned }] = await Promise.all([
      supabase.from("achievements").select("id, slug, title, description, icon").order("sort_order"),
      supabase
        .from("user_achievements")
        .select("achievement_id, earned_at")
        .eq("user_id", user.id),
    ]);

    const earnedAtById = new Map((earned ?? []).map((e) => [e.achievement_id, e.earned_at]));

    const achievements: AchievementStatus[] = (catalog ?? []).map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description,
      icon: a.icon,
      earned: earnedAtById.has(a.id),
      earnedAt: earnedAtById.get(a.id) ?? null,
    }));

    return Response.json({ success: true, achievements });
  } catch (error) {
    console.error("Progress achievements error:", error);

    return Response.json(
      { success: false, message: "Failed to load achievements." },
      { status: 500 }
    );
  }
}
