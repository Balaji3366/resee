"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { AdminQuestionType, AdminQuizQuestionDetail } from "@/types/admin";

export interface QuestionFormValues {
  question: string;
  questionType: AdminQuestionType;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation: string;
  difficulty: string | null;
  marks: number;
}

/** Every question bank (quiz_questions, practice_questions,
 *  course_exam_questions) shares this core shape; only quiz_questions/
 *  course_exam_questions additionally have difficulty/marks/
 *  timeLimitSeconds (added in 0006_admin_panel.sql) — practice_questions
 *  doesn't, hence those three being optional here. */
export type EditableQuestion = Pick<
  AdminQuizQuestionDetail,
  "id" | "question" | "questionType" | "options" | "correctOptionIds" | "explanation"
> &
  Partial<Pick<AdminQuizQuestionDetail, "difficulty" | "marks" | "timeLimitSeconds">>;

const OPTION_LETTERS = "abcdefghij".split("");
const TRUE_FALSE_OPTIONS = [
  { id: "true", text: "True" },
  { id: "false", text: "False" },
];

const TYPE_LABELS: Record<AdminQuestionType, string> = {
  single_choice: "Single Choice",
  multiple_select: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
};

/**
 * Shared question editor for every MCQ-style question bank in the app
 * (quiz_questions, practice_questions, course_exam_questions — all three
 * share the identical question/question_type/options/correct_option_ids/
 * explanation/difficulty/marks/sort_order shape). `allowedTypes` restricts
 * the type dropdown to what that bank's DB check constraint actually
 * permits (Learning quizzes and course exams don't support true_false;
 * see supabase/migrations/0014_learning_ecosystem_gaps.sql).
 */
export default function AdminQuestionEditor({
  initial,
  allowedTypes = ["single_choice", "multiple_select", "true_false", "fill_blank"],
  showDifficultyAndMarks = true,
  onSave,
  onCancel,
  saving,
}: {
  initial?: EditableQuestion;
  allowedTypes?: AdminQuestionType[];
  /** practice_questions has no difficulty/marks columns (only
   *  quiz_questions/course_exam_questions do, added in 0006) — hide
   *  these fields rather than collect values that get silently
   *  dropped. */
  showDifficultyAndMarks?: boolean;
  onSave: (values: QuestionFormValues) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [questionType, setQuestionType] = useState<AdminQuestionType>(
    initial?.questionType ?? allowedTypes[0]
  );
  const [options, setOptions] = useState<{ id: string; text: string }[]>(
    initial?.questionType === "fill_blank" || initial?.questionType === "true_false"
      ? []
      : (initial?.options ?? [
          { id: "a", text: "" },
          { id: "b", text: "" },
        ])
  );
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>(
    initial?.correctOptionIds ?? []
  );
  const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>(
    initial?.questionType === "fill_blank" && initial.correctOptionIds.length > 0
      ? initial.correctOptionIds
      : [""]
  );
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "");
  const [marks, setMarks] = useState(initial?.marks ?? 1);

  function handleTypeChange(type: AdminQuestionType) {
    setQuestionType(type);
    setCorrectOptionIds([]);

    if (type === "true_false") {
      setOptions(TRUE_FALSE_OPTIONS);
    } else if (type === "fill_blank") {
      setOptions([]);
    } else if (
      options.length === 0 ||
      questionType === "true_false" ||
      questionType === "fill_blank"
    ) {
      setOptions([
        { id: "a", text: "" },
        { id: "b", text: "" },
      ]);
    }
  }

  function addOption() {
    const nextLetter = OPTION_LETTERS[options.length];
    if (!nextLetter) return;
    setOptions((prev) => [...prev, { id: nextLetter, text: "" }]);
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
    setCorrectOptionIds((prev) => prev.filter((cid) => cid !== id));
  }

  function toggleCorrect(id: string) {
    if (questionType === "multiple_select") {
      setCorrectOptionIds((prev) =>
        prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
      );
    } else {
      setCorrectOptionIds([id]);
    }
  }

  function addAcceptedAnswer() {
    setAcceptedAnswers((prev) => [...prev, ""]);
  }

  function removeAcceptedAnswer(index: number) {
    setAcceptedAnswers((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAcceptedAnswer(index: number, value: string) {
    setAcceptedAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  function handleSave() {
    if (!question.trim() || !explanation.trim()) return;

    if (questionType === "fill_blank") {
      const cleaned = acceptedAnswers.map((a) => a.trim()).filter(Boolean);
      if (cleaned.length === 0) return;

      onSave({
        question,
        questionType,
        options: [],
        correctOptionIds: cleaned,
        explanation,
        difficulty: difficulty || null,
        marks,
      });
      return;
    }

    if (options.some((o) => !o.text.trim()) || correctOptionIds.length === 0) return;

    onSave({
      question,
      questionType,
      options,
      correctOptionIds,
      explanation,
      difficulty: difficulty || null,
      marks,
    });
  }

  return (
    <div className="rounded-2xl border border-amber/20 bg-ink p-6">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
        />
      </div>

      <div
        className={`mt-4 grid gap-4 ${showDifficultyAndMarks ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}
      >
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Type</label>
          <select
            value={questionType}
            onChange={(e) => handleTypeChange(e.target.value as AdminQuestionType)}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          >
            {allowedTypes.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        {showDifficultyAndMarks && (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
              >
                <option value="">Unset</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate">Marks</label>
              <input
                type="number"
                min={1}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
              />
            </div>
          </>
        )}
      </div>

      {questionType === "fill_blank" ? (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate">
            Acceptable answers (any one match counts as correct, case-insensitive)
          </label>

          <div className="space-y-2">
            {acceptedAnswers.map((answer, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  value={answer}
                  onChange={(e) => updateAcceptedAnswer(index, e.target.value)}
                  placeholder="Accepted answer"
                  className="flex-1 rounded-xl border border-bone/15 bg-panel px-4 py-2.5 text-bone outline-none focus:border-amber"
                />
                {acceptedAnswers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAcceptedAnswer(index)}
                    className="text-slate hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAcceptedAnswer}
            className="mt-3 flex items-center gap-1 rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-bone transition hover:border-amber"
          >
            <Plus size={14} />
            Add Alternate Answer
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate">
            Options (check the correct {questionType === "multiple_select" ? "answers" : "answer"})
          </label>

          <div className="space-y-2">
            {options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-3">
                <input
                  type={questionType === "multiple_select" ? "checkbox" : "radio"}
                  checked={correctOptionIds.includes(opt.id)}
                  onChange={() => toggleCorrect(opt.id)}
                  className="h-5 w-5 accent-amber"
                />
                <input
                  value={opt.text}
                  disabled={questionType === "true_false"}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o))
                    )
                  }
                  placeholder={`Option ${opt.id.toUpperCase()}`}
                  className="flex-1 rounded-xl border border-bone/15 bg-panel px-4 py-2.5 text-bone outline-none focus:border-amber disabled:opacity-70"
                />
                {questionType !== "true_false" && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="text-slate hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {questionType !== "true_false" && options.length < OPTION_LETTERS.length && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 flex items-center gap-1 rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-bone transition hover:border-amber"
            >
              <Plus size={14} />
              Add Option
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold text-slate">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl border border-bone/15 px-5 py-2.5 font-semibold text-bone"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-amber px-6 py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Question"}
        </button>
      </div>
    </div>
  );
}
