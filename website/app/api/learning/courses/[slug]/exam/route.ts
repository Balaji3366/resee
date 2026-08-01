import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CourseExamSummary, QuizQuestionPublic } from "@/types/learning";

export const dynamic = "force-dynamic";

/** Whether every module in the course has its quiz passed (or has no
 *  quiz) and every lesson is complete — the exam itself doesn't count
 *  toward this, since it's what we're about to gate access to. */
async function areAllModulesComplete(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  userId: string,
  courseId: string
) {
  const [{ data: lessons }, { data: quizzes }] = await Promise.all([
    supabase.from("lessons").select("id").eq("course_id", courseId),
    supabase.from("quizzes").select("module_id").eq("course_id", courseId),
  ]);

  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return false;

  const { count: completedLessonCount } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if ((completedLessonCount ?? 0) < lessonIds.length) return false;

  const quizModuleIds = (quizzes ?? []).map((q) => q.module_id);
  if (quizModuleIds.length === 0) return true;

  const { count: passedCount } = await supabase
    .from("module_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("quiz_passed", true)
    .in("module_id", quizModuleIds);

  return (passedCount ?? 0) >= quizModuleIds.length;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
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

    const { data: exam } = await supabase
      .from("course_exams")
      .select("id, slug, title, passing_score, estimated_minutes")
      .eq("course_id", course.id)
      .maybeSingle();

    if (!exam) {
      return Response.json(
        { success: false, message: "This course has no final exam." },
        { status: 404 }
      );
    }

    const modulesComplete = await areAllModulesComplete(supabase, user.id, course.id);

    if (!modulesComplete) {
      return Response.json(
        { success: false, message: "Complete every module before taking the final exam." },
        { status: 403 }
      );
    }

    const { data: bestAttempt } = await supabase
      .from("course_exam_attempts")
      .select("passed")
      .eq("user_id", user.id)
      .eq("exam_id", exam.id)
      .eq("passed", true)
      .limit(1)
      .maybeSingle();

    const { data: questionRows } = await supabaseAdmin
      .from("course_exam_questions")
      .select("id, question, question_type, options, sort_order")
      .eq("exam_id", exam.id)
      .order("sort_order");

    const questions: QuizQuestionPublic[] = (questionRows ?? []).map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.question_type,
      options: q.options,
    }));

    if (questions.length === 0) {
      return Response.json(
        { success: false, message: "This exam has no questions yet." },
        { status: 500 }
      );
    }

    const summary: CourseExamSummary = {
      id: exam.id,
      slug: exam.slug,
      title: exam.title,
      passingScore: exam.passing_score,
      estimatedMinutes: exam.estimated_minutes,
      passed: !!bestAttempt,
      questions,
    };

    return Response.json({ success: true, exam: summary });
  } catch (error) {
    console.error("Course exam fetch error:", error);

    return Response.json(
      { success: false, message: "Failed to load the final exam." },
      { status: 500 }
    );
  }
}
