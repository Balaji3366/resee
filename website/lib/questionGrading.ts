/**
 * Shared answer-correctness check for every MCQ-style question bank
 * (quiz_questions, practice_questions, course_exam_questions) — was
 * previously duplicated verbatim as `sameOptionSet` in
 * lib/practiceGrading.ts and the learning quiz attempt route.
 *
 * For choice-based types, `correctOptionIds` holds option ids and
 * correctness is set equality. For `fill_blank`, `correctOptionIds`
 * instead holds an array of acceptable answer strings (see
 * supabase/migrations/0014_learning_ecosystem_gaps.sql) and
 * `submitted` is expected to be a single-element array holding the
 * user's typed text — compared case-insensitively and trimmed.
 */
export function isAnswerCorrect(
  questionType: string,
  submitted: string[],
  correctOptionIds: string[]
): boolean {
  if (questionType === "fill_blank") {
    const typed = (submitted[0] ?? "").trim().toLowerCase();
    if (!typed) return false;
    return correctOptionIds.some((accepted) => accepted.trim().toLowerCase() === typed);
  }

  if (submitted.length !== correctOptionIds.length) return false;
  const correctSet = new Set(correctOptionIds);
  return submitted.every((id) => correctSet.has(id));
}
