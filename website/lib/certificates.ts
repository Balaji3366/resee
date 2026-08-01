import type { SupabaseClient } from "@supabase/supabase-js";

function generateCertificateNumber(): string {
  return `RESEE-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
}

/**
 * A course counts as complete once every module that has a quiz has had
 * that quiz passed, every lesson in the course is marked complete, and
 * — if the course has a course_exams row — that exam has been passed.
 * Courses with a course_exams row require it explicitly; courses
 * without one are satisfied by module/lesson completion alone.
 */
export async function isCourseComplete(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<boolean> {
  const [{ data: lessons }, { data: quizzes }, { data: exam }] = await Promise.all([
    supabase.from("lessons").select("id").eq("course_id", courseId),
    supabase.from("quizzes").select("id, module_id").eq("course_id", courseId),
    supabase.from("course_exams").select("id").eq("course_id", courseId).maybeSingle(),
  ]);

  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return false;

  const { count: completedLessonCount } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  const allLessonsComplete = (completedLessonCount ?? 0) >= lessonIds.length;

  const quizModuleIds = (quizzes ?? []).map((q) => q.module_id);
  let allQuizzesPassed = true;

  if (quizModuleIds.length > 0) {
    const { count: passedCount } = await supabase
      .from("module_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("quiz_passed", true)
      .in("module_id", quizModuleIds);

    allQuizzesPassed = (passedCount ?? 0) >= quizModuleIds.length;
  }

  let examPassed = true;

  if (exam) {
    const { data: passedAttempt } = await supabase
      .from("course_exam_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("exam_id", exam.id)
      .eq("passed", true)
      .limit(1)
      .maybeSingle();

    examPassed = !!passedAttempt;
  }

  return allLessonsComplete && allQuizzesPassed && examPassed;
}

/**
 * Idempotent: returns the existing certificate if one was already
 * issued, issues a new one if the user has just become eligible, or
 * returns null if not yet eligible. Race-safe the same way
 * lib/practiceAttempts.ts:findOrCreateInProgressAttempt is — two
 * concurrent eligibility checks resolve to the same row via the
 * unique(user_id, course_id) constraint plus a 23505 catch-and-refetch,
 * not a second, conflicting certificate.
 */
export async function issueCertificateIfEligible(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<{ certificateNumber: string; issuedAt: string } | null> {
  const { data: existing } = await supabase
    .from("course_certificates")
    .select("certificate_number, issued_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return { certificateNumber: existing.certificate_number, issuedAt: existing.issued_at };
  }

  const complete = await isCourseComplete(supabase, userId, courseId);
  if (!complete) return null;

  const { data: created, error } = await supabase
    .from("course_certificates")
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: generateCertificateNumber(),
    })
    .select("certificate_number, issued_at")
    .single();

  if (!error) {
    return { certificateNumber: created.certificate_number, issuedAt: created.issued_at };
  }

  if (error.code === "23505") {
    const { data: raceWinner } = await supabase
      .from("course_certificates")
      .select("certificate_number, issued_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    return raceWinner
      ? { certificateNumber: raceWinner.certificate_number, issuedAt: raceWinner.issued_at }
      : null;
  }

  throw error;
}
