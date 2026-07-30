import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminCategory, AdminCourseSummary, CourseStatus } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("courses")
      .select(
        `
        id, slug, title, tagline, status, is_available, updated_at,
        category:learning_categories(id, slug, name, icon),
        course_modules(id, lessons(id))
      `
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const courses: AdminCourseSummary[] = (data ?? []).map((c) => {
      const modules = (c.course_modules ?? []) as { id: string; lessons: { id: string }[] }[];

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        tagline: c.tagline,
        status: c.status as CourseStatus,
        isAvailable: c.is_available,
        category: (c.category as unknown as AdminCategory) ?? null,
        moduleCount: modules.length,
        lessonCount: modules.reduce((sum, m) => sum + (m.lessons ?? []).length, 0),
        updatedAt: c.updated_at,
      };
    });

    return Response.json({ success: true, courses });
  } catch (error) {
    console.error("Admin courses list error:", error);

    return Response.json(
      { success: false, message: "Failed to load learning paths." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, title, tagline, description, difficulty, icon, categoryId } = body ?? {};

    if (!slug || !title || !description || !difficulty || !icon) {
      return Response.json(
        { success: false, message: "slug, title, description, difficulty, and icon are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert({
        slug,
        title,
        tagline: tagline ?? null,
        description,
        difficulty,
        icon,
        category_id: categoryId ?? null,
        status: "draft",
        is_available: false,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, courseId: data.id });
  } catch (error) {
    console.error("Admin course create error:", error);

    return Response.json(
      { success: false, message: "Failed to create learning path." },
      { status: 500 }
    );
  }
}
