import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getModuleUnlockContext, isModuleUnlocked } from "@/lib/learningAccess";
import { computeStreakUpdate } from "@/lib/learningStreak";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; lessonSlug: string }> }
) {
  try {
    const { slug, lessonSlug } = await params;
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

    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!course) {
      return Response.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (!enrollment) {
      return Response.json(
        { success: false, message: "You're not enrolled in this course." },
        { status: 403 }
      );
    }

    const { data: lesson } = await supabase
      .from("lessons")
      .select("id, module_id, estimated_minutes")
      .eq("course_id", course.id)
      .eq("slug", lessonSlug)
      .maybeSingle();

    if (!lesson) {
      return Response.json(
        { success: false, message: "Lesson not found." },
        { status: 404 }
      );
    }

    const { modules, passedModuleIds } = await getModuleUnlockContext(
      supabase,
      course.id,
      user.id
    );

    if (!isModuleUnlocked(lesson.module_id, modules, passedModuleIds, true)) {
      return Response.json(
        { success: false, message: "This module is locked." },
        { status: 403 }
      );
    }

    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle();

    const alreadyCompleted = !!existing;

    if (!alreadyCompleted) {
      const { error: insertError } = await supabase.from("lesson_progress").insert({
        user_id: user.id,
        lesson_id: lesson.id,
        course_id: course.id,
      });

      if (insertError) throw insertError;
    }

    const { data: moduleLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("module_id", lesson.module_id);

    const moduleLessonIds = (moduleLessons ?? []).map((l) => l.id);

    const { count: completedInModule } = moduleLessonIds.length
      ? await supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("lesson_id", moduleLessonIds)
      : { count: 0 };

    await supabase.from("module_progress").upsert(
      {
        user_id: user.id,
        module_id: lesson.module_id,
        course_id: course.id,
        lessons_completed_count: completedInModule ?? 0,
      },
      { onConflict: "user_id,module_id" }
    );

    await supabase
      .from("enrollments")
      .update({ last_lesson_id: lesson.id, last_activity_at: new Date().toISOString() })
      .eq("id", enrollment.id);

    if (!alreadyCompleted) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("current_streak, longest_streak, last_activity_date, total_learning_minutes")
        .eq("id", user.id)
        .maybeSingle();

      const streak = computeStreakUpdate({
        currentStreak: profile?.current_streak ?? 0,
        longestStreak: profile?.longest_streak ?? 0,
        lastActivityDate: profile?.last_activity_date ?? null,
      });

      await supabaseAdmin
        .from("profiles")
        .update({
          current_streak: streak.currentStreak,
          longest_streak: streak.longestStreak,
          last_activity_date: streak.lastActivityDate,
          total_learning_minutes:
            (profile?.total_learning_minutes ?? 0) + lesson.estimated_minutes,
        })
        .eq("id", user.id);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Lesson complete error:", error);

    return Response.json(
      { success: false, message: "Failed to mark lesson complete." },
      { status: 500 }
    );
  }
}
