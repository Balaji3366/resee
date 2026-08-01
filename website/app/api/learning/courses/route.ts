import { getServerSupabase } from "@/lib/supabaseServer";
import type { CourseSummary, LearningCategory } from "@/types/learning";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: categories } = await supabase
      .from("learning_categories")
      .select("id, slug, name, icon")
      .order("sort_order");

    let coursesQuery = supabase
      .from("courses")
      .select(
        `
        id, slug, title, tagline, description, difficulty, icon, is_available,
        category:learning_categories(id, slug, name, icon),
        course_modules(id),
        lessons(estimated_minutes)
      `
      )
      .order("sort_order");

    if (query) {
      // Strip characters that are syntactically meaningful to
      // PostgREST's `.or()` filter DSL (comma separates conditions,
      // parentheses group them) so a search term containing them can't
      // produce a malformed filter.
      const safeQuery = query.replace(/[,()]/g, " ").trim();

      if (safeQuery) {
        coursesQuery = coursesQuery.or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
        );
      }
    }

    const { data: courses, error: coursesError } = await coursesQuery;

    if (coursesError) throw coursesError;

    const [{ data: enrollments }, { data: progressRows }] = await Promise.all([
      supabase.from("enrollments").select("course_id").eq("user_id", user.id),
      supabase.from("lesson_progress").select("course_id").eq("user_id", user.id),
    ]);

    const enrolledCourseIds = new Set((enrollments ?? []).map((e) => e.course_id));

    const completedByCourseId = new Map<string, number>();
    for (const row of progressRows ?? []) {
      completedByCourseId.set(row.course_id, (completedByCourseId.get(row.course_id) ?? 0) + 1);
    }

    const summaries: CourseSummary[] = (courses ?? []).map((course) => {
      const lessons = (course.lessons ?? []) as { estimated_minutes: number }[];
      const lessonCount = lessons.length;
      const totalMinutes = lessons.reduce((sum, l) => sum + l.estimated_minutes, 0);
      const isEnrolled = enrolledCourseIds.has(course.id);
      const completed = completedByCourseId.get(course.id) ?? 0;

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        tagline: course.tagline,
        description: course.description,
        difficulty: course.difficulty,
        icon: course.icon,
        isAvailable: course.is_available,
        category: (course.category as unknown as LearningCategory) ?? null,
        moduleCount: (course.course_modules ?? []).length,
        lessonCount,
        totalMinutes,
        isEnrolled,
        progressPercent:
          isEnrolled && lessonCount > 0 ? Math.round((completed / lessonCount) * 100) : 0,
      };
    });

    return Response.json({
      success: true,
      categories: (categories ?? []) as LearningCategory[],
      courses: summaries,
    });
  } catch (error) {
    console.error("Learning catalog error:", error);

    return Response.json(
      { success: false, message: "Failed to load learning catalog." },
      { status: 500 }
    );
  }
}
