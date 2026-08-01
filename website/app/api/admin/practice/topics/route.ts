import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminPracticeCategory, AdminPracticeTopicSummary } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("practice_topics")
      .select(
        `
        id, slug, title, difficulty, is_available, updated_at,
        category:practice_categories(id, slug, name, icon),
        practice_questions(id)
      `
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const topics: AdminPracticeTopicSummary[] = (data ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      difficulty: t.difficulty,
      isAvailable: t.is_available,
      category: (t.category as unknown as AdminPracticeCategory) ?? null,
      questionCount: (t.practice_questions ?? []).length,
      updatedAt: t.updated_at,
    }));

    return Response.json({ success: true, topics });
  } catch (error) {
    console.error("Admin practice topics list error:", error);

    return Response.json(
      { success: false, message: "Failed to load practice topics." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, title, description, difficulty, icon, categoryId, estimatedMinutes } = body ?? {};

    if (!slug || !title || !description || !difficulty || !icon) {
      return Response.json(
        { success: false, message: "slug, title, description, difficulty, and icon are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("practice_topics")
      .insert({
        slug,
        title,
        description,
        difficulty,
        icon,
        category_id: categoryId ?? null,
        estimated_minutes: estimatedMinutes ?? 15,
        is_available: false,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, topicId: data.id });
  } catch (error) {
    console.error("Admin practice topic create error:", error);

    return Response.json(
      { success: false, message: "Failed to create practice topic." },
      { status: 500 }
    );
  }
}
