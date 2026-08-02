import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type {
  AdminInterviewCategory,
  AdminInterviewRole,
  AdminInterviewSetSummary,
} from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("interview_sets")
      .select(
        `
        id, slug, title, experience_level, is_available,
        category:interview_categories(id, slug, name, icon, description, is_available, sort_order),
        role:interview_roles(id, slug, name, icon, sort_order),
        interview_questions(id)
      `
      )
      .order("sort_order");

    if (error) throw error;

    const sets: AdminInterviewSetSummary[] = (data ?? []).map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      experienceLevel: s.experience_level,
      isAvailable: s.is_available,
      category: (s.category as unknown as AdminInterviewCategory) ?? null,
      role: (s.role as unknown as AdminInterviewRole) ?? null,
      questionCount: (s.interview_questions ?? []).length,
    }));

    return Response.json({ success: true, sets });
  } catch (error) {
    console.error("Admin interview sets list error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview sets." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, title, description, categoryId, roleId, experienceLevel, estimatedMinutes } =
      body ?? {};

    if (!slug || !title || !description || !categoryId || !roleId || !experienceLevel) {
      return Response.json(
        {
          success: false,
          message:
            "slug, title, description, categoryId, roleId, and experienceLevel are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("interview_sets")
      .insert({
        slug,
        title,
        description,
        category_id: categoryId,
        role_id: roleId,
        experience_level: experienceLevel,
        estimated_minutes: estimatedMinutes ?? 20,
        is_available: false,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          {
            success: false,
            message: "A set for this category/role/experience level already exists.",
          },
          { status: 409 }
        );
      }
      throw error;
    }

    return Response.json({ success: true, setId: data.id });
  } catch (error) {
    console.error("Admin interview set create error:", error);

    return Response.json(
      { success: false, message: "Failed to create interview set." },
      { status: 500 }
    );
  }
}
