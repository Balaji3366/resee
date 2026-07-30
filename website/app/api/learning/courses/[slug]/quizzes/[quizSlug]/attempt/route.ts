import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getModuleUnlockContext, isModuleUnlocked } from "@/lib/learningAccess";
import { computeStreakUpdate } from "@/lib/learningStreak";
import { checkAndAwardAchievements } from "@/lib/achievements";
import type { QuizAttemptQuestionResult } from "@/types/learning";

export const dynamic = "force-dynamic";

function sameOptionSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; quizSlug: string }> }
) {
  try {
    const { slug, quizSlug } = await params;
    const body = await request.json();
    const submittedAnswers: Record<string, string[]> = body?.answers ?? {};

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

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("id, module_id, passing_score, estimated_minutes")
      .eq("course_id", course.id)
      .eq("slug", quizSlug)
      .maybeSingle();

    if (!quiz) {
      return Response.json(
        { success: false, message: "Quiz not found." },
        { status: 404 }
      );
    }

    const { modules, passedModuleIds } = await getModuleUnlockContext(
      supabase,
      course.id,
      user.id
    );

    if (!isModuleUnlocked(quiz.module_id, modules, passedModuleIds, true)) {
      return Response.json(
        { success: false, message: "This module is locked." },
        { status: 403 }
      );
    }

    const { data: moduleLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("module_id", quiz.module_id);

    const moduleLessonIds = (moduleLessons ?? []).map((l) => l.id);

    if (moduleLessonIds.length > 0) {
      const { count: completedCount } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("lesson_id", moduleLessonIds);

      if ((completedCount ?? 0) < moduleLessonIds.length) {
        return Response.json(
          {
            success: false,
            message: "Complete all lessons in this module before taking the quiz.",
          },
          { status: 403 }
        );
      }
    }

    const { data: questions } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, correct_option_ids, explanation")
      .eq("quiz_id", quiz.id);

    if (!questions || questions.length === 0) {
      return Response.json(
        { success: false, message: "This quiz has no questions yet." },
        { status: 500 }
      );
    }

    const results: QuizAttemptQuestionResult[] = questions.map((q) => {
      const correctOptionIds = q.correct_option_ids as string[];
      const submitted = submittedAnswers[q.id] ?? [];

      return {
        questionId: q.id,
        correct: sameOptionSet(submitted, correctOptionIds),
        correctOptionIds,
        explanation: q.explanation,
      };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passing_score;

    const { error: attemptError } = await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      quiz_id: quiz.id,
      course_id: course.id,
      module_id: quiz.module_id,
      score,
      passed,
      answers: submittedAnswers,
    });

    if (attemptError) throw attemptError;

    const { data: existingProgress } = await supabase
      .from("module_progress")
      .select("quiz_passed, quiz_best_score")
      .eq("user_id", user.id)
      .eq("module_id", quiz.module_id)
      .maybeSingle();

    const wasAlreadyPassed = existingProgress?.quiz_passed ?? false;
    const newlyPassed = passed && !wasAlreadyPassed;

    await supabase.from("module_progress").upsert(
      {
        user_id: user.id,
        module_id: quiz.module_id,
        course_id: course.id,
        quiz_passed: wasAlreadyPassed || passed,
        quiz_best_score: Math.max(existingProgress?.quiz_best_score ?? 0, score),
        completed_at:
          wasAlreadyPassed || passed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,module_id" }
    );

    await checkAndAwardAchievements(user.id);

    if (newlyPassed) {
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
            (profile?.total_learning_minutes ?? 0) + quiz.estimated_minutes,
        })
        .eq("id", user.id);
    }

    return Response.json({
      success: true,
      score,
      passed,
      results,
      nextModuleUnlocked: wasAlreadyPassed || passed,
    });
  } catch (error) {
    console.error("Quiz attempt error:", error);

    return Response.json(
      { success: false, message: "Failed to submit quiz attempt." },
      { status: 500 }
    );
  }
}
