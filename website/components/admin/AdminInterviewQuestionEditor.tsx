"use client";

import { useState } from "react";
import type { AdminInterviewQuestionDetail } from "@/types/admin";

export interface InterviewQuestionFormValues {
  question: string;
  questionType: "short_text" | "long_text";
}

/**
 * interview_questions holds only open-ended prompts (no options/correct
 * answers, unlike quiz_questions/practice_questions) — so this is a
 * much simpler editor than AdminQuestionEditor.tsx, not a variant of it.
 */
export default function AdminInterviewQuestionEditor({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: AdminInterviewQuestionDetail;
  onSave: (values: InterviewQuestionFormValues) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [questionType, setQuestionType] = useState<"short_text" | "long_text">(
    initial?.questionType ?? "long_text"
  );

  function handleSave() {
    if (!question.trim()) return;
    onSave({ question, questionType });
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

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold text-slate">
          Expected answer length
        </label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as "short_text" | "long_text")}
          className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
        >
          <option value="short_text">Short answer</option>
          <option value="long_text">Long answer</option>
        </select>
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
