import { getServerSupabase } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAnswerCorrect } from "@/lib/questionGrading";
import { issueCertificateIfEligible } from "@/lib/certificates";
import { computeStreakUpdate } from "@/lib/learningStreak";
import type { QuizAttemptQuestionResult } from "@/types/learning";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const submittedAnswers: Record<string, string[]> = body?.answers ?? {};

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
      .select("id, passing_score, estimated_minutes")
      .eq("course_id", course.id)
      .maybeSingle();

    if (!exam) {
      return Response.json(
        { success: false, message: "This course has no final exam." },
        { status: 404 }
      );
    }

    const { data: questions } = await supabaseAdmin
      .from("course_exam_questions")
      .select("id, question_type, correct_option_ids, explanation")
      .eq("exam_id", exam.id);

    if (!questions || questions.length === 0) {
      return Response.json(
        { success: false, message: "This exam has no questions yet." },
        { status: 500 }
      );
    }

    const results: QuizAttemptQuestionResult[] = questions.map((q) => {
      const correctOptionIds = q.correct_option_ids as string[];
      const submitted = submittedAnswers[q.id] ?? [];

      return {
        questionId: q.id,
        correct: isAnswerCorrect(q.question_type, submitted, correctOptionIds),
        correctOptionIds,
        explanation: q.explanation,
      };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= exam.passing_score;

    const { error: attemptError } = await supabase.from("course_exam_attempts").insert({
      user_id: user.id,
      exam_id: exam.id,
      course_id: course.id,
      score,
      passed,
      answers: submittedAnswers,
    });

    if (attemptError) throw attemptError;

    let certificateNumber: string | null = null;

    if (passed) {
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
          total_learning_minutes: (profile?.total_learning_minutes ?? 0) + exam.estimated_minutes,
        })
        .eq("id", user.id);

      const certificate = await issueCertificateIfEligible(supabase, user.id, course.id);
      certificateNumber = certificate?.certificateNumber ?? null;
    }

    return Response.json({
      success: true,
      score,
      passed,
      results,
      certificateIssued: !!certificateNumber,
      certificateNumber,
    });
  } catch (error) {
    console.error("Course exam attempt error:", error);

    return Response.json(
      { success: false, message: "Failed to submit exam attempt." },
      { status: 500 }
    );
  }
}
