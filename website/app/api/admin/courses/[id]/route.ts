import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type {
  AdminCategory,
  AdminCourseDetail,
  AdminModuleDetail,
  AdminQuizDetail,
  AdminQuizQuestionDetail,
  CourseStatus,
} from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select(
        `
        id, slug, title, tagline, description, difficulty, icon, status, is_available,
        banner_url, thumbnail_url, tags,
        category:learning_categories(id, slug, name, icon)
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (courseError) throw courseError;

    if (!course) {
      return Response.json({ success: false, message: "Learning path not found." }, { status: 404 });
    }

    const { data: modules, error: modulesError } = await supabaseAdmin
      .from("course_modules")
      .select(
        `
        id, title, description, sort_order,
        lessons(id, slug, title, content, key_takeaways, estimated_minutes, sort_order, video_url, pdf_url, notes, attachments),
        quizzes(id, slug, title, passing_score, estimated_minutes,
          quiz_questions(id, question, question_type, options, correct_option_ids, explanation, difficulty, marks, time_limit_seconds, sort_order))
      `
      )
      .eq("course_id", id)
      .order("sort_order");

    if (modulesError) throw modulesError;

    const moduleDetails: AdminModuleDetail[] = (modules ?? []).map((mod) => {
      type RawLesson = {
        id: string; slug: string; title: string; content: string;
        key_takeaways: string[]; estimated_minutes: number; sort_order: number;
        video_url: string | null; pdf_url: string | null; notes: string | null;
        attachments: { name: string; url: string }[];
      };

      const lessons = ((mod.lessons ?? []) as RawLesson[])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          content: l.content,
          keyTakeaways: l.key_takeaways ?? [],
          estimatedMinutes: l.estimated_minutes,
          sortOrder: l.sort_order,
          videoUrl: l.video_url,
          pdfUrl: l.pdf_url,
          notes: l.notes,
          attachments: l.attachments ?? [],
        }));

      type RawQuiz = {
        id: string; slug: string; title: string; passing_score: number; estimated_minutes: number;
        quiz_questions: {
          id: string; question: string; question_type: string; options: { id: string; text: string }[];
          correct_option_ids: string[]; explanation: string; difficulty: string | null;
          marks: number; time_limit_seconds: number | null; sort_order: number;
        }[];
      };

      const quizField = mod.quizzes as unknown as RawQuiz | RawQuiz[] | null;
      const rawQuiz: RawQuiz | null = Array.isArray(quizField)
        ? quizField[0] ?? null
        : quizField ?? null;

      let quiz: AdminQuizDetail | null = null;

      if (rawQuiz) {
        const questions: AdminQuizQuestionDetail[] = (rawQuiz.quiz_questions ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((q) => ({
            id: q.id,
            question: q.question,
            questionType: q.question_type as "single_choice" | "multiple_select",
            options: q.options,
            correctOptionIds: q.correct_option_ids,
            explanation: q.explanation,
            difficulty: q.difficulty,
            marks: q.marks,
            timeLimitSeconds: q.time_limit_seconds,
            sortOrder: q.sort_order,
          }));

        quiz = {
          id: rawQuiz.id,
          slug: rawQuiz.slug,
          title: rawQuiz.title,
          passingScore: rawQuiz.passing_score,
          estimatedMinutes: rawQuiz.estimated_minutes,
          questions,
        };
      }

      return {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sort_order,
        lessons,
        quiz,
      };
    });

    const detail: AdminCourseDetail = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      tagline: course.tagline,
      description: course.description,
      difficulty: course.difficulty,
      icon: course.icon,
      status: course.status as CourseStatus,
      isAvailable: course.is_available,
      bannerUrl: course.banner_url,
      thumbnailUrl: course.thumbnail_url,
      tags: course.tags ?? [],
      category: (course.category as unknown as AdminCategory) ?? null,
      modules: moduleDetails,
    };

    return Response.json({ success: true, course: detail });
  } catch (error) {
    console.error("Admin course detail error:", error);

    return Response.json(
      { success: false, message: "Failed to load learning path." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    const fieldMap: Record<string, string> = {
      slug: "slug",
      title: "title",
      tagline: "tagline",
      description: "description",
      difficulty: "difficulty",
      icon: "icon",
      categoryId: "category_id",
      bannerUrl: "banner_url",
      thumbnailUrl: "thumbnail_url",
      tags: "tags",
    };

    for (const [bodyKey, column] of Object.entries(fieldMap)) {
      if (body[bodyKey] !== undefined) updates[column] = body[bodyKey];
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin.from("courses").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin course update error:", error);

    return Response.json(
      { success: false, message: "Failed to update learning path." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest(["super_admin"]);
    if (auth.error) return auth.error;

    const { count } = await supabaseAdmin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", id);

    if ((count ?? 0) > 0) {
      return Response.json(
        {
          success: false,
          message: "This learning path has active enrollments. Archive it instead of deleting.",
        },
        { status: 409 }
      );
    }

    const { error } = await supabaseAdmin.from("courses").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin course delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete learning path." },
      { status: 500 }
    );
  }
}
