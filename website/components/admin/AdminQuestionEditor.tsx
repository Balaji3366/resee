"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { AdminQuizQuestionDetail } from "@/types/admin";

export interface QuestionFormValues {
  question: string;
  questionType: "single_choice" | "multiple_select";
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation: string;
  difficulty: string | null;
  marks: number;
}

const OPTION_LETTERS = "abcdefghij".split("");

export default function AdminQuestionEditor({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: AdminQuizQuestionDetail;
  onSave: (values: QuestionFormValues) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [questionType, setQuestionType] = useState<"single_choice" | "multiple_select">(
    initial?.questionType ?? "single_choice"
  );
  const [options, setOptions] = useState<{ id: string; text: string }[]>(
    initial?.options ?? [
      { id: "a", text: "" },
      { id: "b", text: "" },
    ]
  );
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>(
    initial?.correctOptionIds ?? []
  );
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "");
  const [marks, setMarks] = useState(initial?.marks ?? 1);

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
    if (questionType === "single_choice") {
      setCorrectOptionIds([id]);
    } else {
      setCorrectOptionIds((prev) =>
        prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
      );
    }
  }

  function handleSave() {
    if (!question.trim() || options.some((o) => !o.text.trim()) || correctOptionIds.length === 0) {
      return;
    }

    onSave({ question, questionType, options, correctOptionIds, explanation, difficulty: difficulty || null, marks });
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

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Type</label>
          <select
            value={questionType}
            onChange={(e) => {
              const type = e.target.value as "single_choice" | "multiple_select";
              setQuestionType(type);
              if (type === "single_choice" && correctOptionIds.length > 1) {
                setCorrectOptionIds([correctOptionIds[0]]);
              }
            }}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          >
            <option value="single_choice">Single Choice</option>
            <option value="multiple_select">Multiple Choice</option>
          </select>
        </div>

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
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold text-slate">
          Options (check the correct {questionType === "single_choice" ? "answer" : "answers"})
        </label>

        <div className="space-y-2">
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-3">
              <input
                type={questionType === "single_choice" ? "radio" : "checkbox"}
                checked={correctOptionIds.includes(opt.id)}
                onChange={() => toggleCorrect(opt.id)}
                className="h-5 w-5 accent-amber"
              />
              <input
                value={opt.text}
                onChange={(e) =>
                  setOptions((prev) =>
                    prev.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o))
                  )
                }
                placeholder={`Option ${opt.id.toUpperCase()}`}
                className="flex-1 rounded-xl border border-bone/15 bg-panel px-4 py-2.5 text-bone outline-none focus:border-amber"
              />
              {options.length > 2 && (
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

        {options.length < OPTION_LETTERS.length && (
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
