import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  CourseDetail,
  LessonSummary,
  ModuleSummary,
  QuizQuestionPublic,
} from "@/types/learning";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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
      .select("id, slug, title, tagline, description, difficulty, icon, is_available")
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

    const isEnrolled = !!enrollment;

    const { data: modules } = await supabase
      .from("course_modules")
      .select(
        `
        id, title, description, sort_order,
        lessons(id, slug, title, content, key_takeaways, estimated_minutes, sort_order),
        quizzes(id, slug, title, passing_score, estimated_minutes)
      `
      )
      .eq("course_id", course.id)
      .order("sort_order");

    const moduleIds = (modules ?? []).map((m) => m.id);

    const [{ data: moduleProgressRows }, { data: lessonProgressRows }] =
      await Promise.all([
        moduleIds.length
          ? supabase
              .from("module_progress")
              .select("module_id, quiz_passed, quiz_best_score")
              .eq("user_id", user.id)
              .in("module_id", moduleIds)
          : Promise.resolve({ data: [] }),
        supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("course_id", course.id),
      ]);

    const passedModuleIds = new Set(
      (moduleProgressRows ?? []).filter((m) => m.quiz_passed).map((m) => m.module_id)
    );
    const bestScoreByModuleId = new Map(
      (moduleProgressRows ?? []).map((m) => [m.module_id, m.quiz_best_score as number | null])
    );
    const completedLessonIds = new Set((lessonProgressRows ?? []).map((l) => l.lesson_id));

    let totalLessons = 0;
    let totalMinutes = 0;
    let completedCount = 0;

    const moduleSummaries: ModuleSummary[] = [];

    for (let i = 0; i < (modules ?? []).length; i++) {
      const mod = modules![i];
      const unlocked = isEnrolled && (i === 0 || passedModuleIds.has(modules![i - 1].id));

      const rawLessons = (mod.lessons ?? []) as {
        id: string;
        slug: string;
        title: string;
        content: string;
        key_takeaways: string[];
        estimated_minutes: number;
        sort_order: number;
      }[];

      rawLessons.sort((a, b) => a.sort_order - b.sort_order);

      const lessons: LessonSummary[] = rawLessons.map((lesson) => {
        totalLessons += 1;
        totalMinutes += lesson.estimated_minutes;

        const completed = completedLessonIds.has(lesson.id);
        if (completed) completedCount += 1;

        return {
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          estimatedMinutes: lesson.estimated_minutes,
          completed,
          content: unlocked ? lesson.content : null,
          keyTakeaways: unlocked ? lesson.key_takeaways : null,
        };
      });

      // `quizzes` is a reverse one-to-one embed (unique FK on module_id) —
      // PostgREST may return this as either a single object or a
      // single-element array depending on relationship inference, so
      // normalize defensively rather than assuming one shape.
      type RawQuiz = {
        id: string;
        slug: string;
        title: string;
        passing_score: number;
        estimated_minutes: number;
      };

      const quizField = mod.quizzes as unknown as RawQuiz | RawQuiz[] | null;
      const rawQuiz: RawQuiz | null = Array.isArray(quizField)
        ? quizField[0] ?? null
        : quizField ?? null;

      let quiz: ModuleSummary["quiz"] = null;

      if (rawQuiz) {
        totalMinutes += rawQuiz.estimated_minutes;

        let questions: QuizQuestionPublic[] | null = null;

        if (unlocked) {
          const { data: questionRows } = await supabaseAdmin
            .from("quiz_questions")
            .select("id, question, question_type, options, sort_order")
            .eq("quiz_id", rawQuiz.id)
            .order("sort_order");

          questions = (questionRows ?? []).map((q) => ({
            id: q.id,
            question: q.question,
            questionType: q.question_type,
            options: q.options,
          }));
        }

        quiz = {
          id: rawQuiz.id,
          slug: rawQuiz.slug,
          title: rawQuiz.title,
          passingScore: rawQuiz.passing_score,
          estimatedMinutes: rawQuiz.estimated_minutes,
          passed: passedModuleIds.has(mod.id),
          bestScore: bestScoreByModuleId.get(mod.id) ?? null,
          questions,
        };
      }

      moduleSummaries.push({
        id: mod.id,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sort_order,
        unlocked,
        lessons,
        quiz,
      });
    }

    const detail: CourseDetail = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      tagline: course.tagline,
      description: course.description,
      difficulty: course.difficulty,
      icon: course.icon,
      isAvailable: course.is_available,
      totalLessons,
      totalMinutes,
      isEnrolled,
      progressPercent:
        isEnrolled && totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0,
      modules: moduleSummaries,
    };

    return Response.json({ success: true, course: detail });
  } catch (error) {
    console.error("Course detail error:", error);

    return Response.json(
      { success: false, message: "Failed to load course." },
      { status: 500 }
    );
  }
}
