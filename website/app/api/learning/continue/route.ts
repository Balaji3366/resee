import { getServerSupabase } from "@/lib/supabaseServer";
import type { ContinueLearningData } from "@/types/learning";

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

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("course_id, last_lesson_id")
      .eq("user_id", user.id)
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .order("enrolled_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!enrollment) {
      return Response.json({ success: true, data: null });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("slug, title")
      .eq("id", enrollment.course_id)
      .maybeSingle();

    if (!course) {
      return Response.json({ success: true, data: null });
    }

    const { data: lessons } = await supabase
      .from("lessons")
      .select(
        `
        id, slug, title, sort_order,
        course_modules!inner(sort_order)
      `
      )
      .eq("course_id", enrollment.course_id);

    const orderedLessons = (lessons ?? []).slice().sort((a, b) => {
      const aModuleOrder = (a.course_modules as unknown as { sort_order: number }).sort_order;
      const bModuleOrder = (b.course_modules as unknown as { sort_order: number }).sort_order;
      if (aModuleOrder !== bModuleOrder) return aModuleOrder - bModuleOrder;
      return a.sort_order - b.sort_order;
    });

    const totalLessons = orderedLessons.length;

    const { count: completedCount } = totalLessons
      ? await supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("course_id", enrollment.course_id)
      : { count: 0 };

    const lastLesson = enrollment.last_lesson_id
      ? orderedLessons.find((l) => l.id === enrollment.last_lesson_id)
      : null;

    const resumeLesson = lastLesson ?? orderedLessons[0] ?? null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user.id)
      .maybeSingle();

    const data: ContinueLearningData = {
      courseSlug: course.slug,
      courseTitle: course.title,
      progressPercent:
        totalLessons > 0
          ? Math.round(((completedCount ?? 0) / totalLessons) * 100)
          : 0,
      lastLessonTitle: lastLesson?.title ?? null,
      resumeSlug: resumeLesson?.slug ?? "",
      currentStreak: profile?.current_streak ?? 0,
    };

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Continue learning error:", error);

    return Response.json(
      { success: false, message: "Failed to load continue-learning data." },
      { status: 500 }
    );
  }
}
