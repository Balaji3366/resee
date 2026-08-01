"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface FillBlankInputProps {
  value: string;
  state?: "default" | "correct" | "incorrect";
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Shown only when state is "correct"/"incorrect", after submission. */
  acceptedAnswer?: string;
}

/**
 * Fill-in-the-blank counterpart to QuizOptionButton — same 3-state
 * (default/correct/incorrect) visual language, but a free-text input
 * instead of a selectable option. Used by QuizRunner.tsx and
 * PracticeQuestionCard.tsx/PracticeCompletionScreen.tsx whenever a
 * question's type is "fill_blank".
 */
export default function FillBlankInput({
  value,
  state = "default",
  onChange,
  disabled,
  acceptedAnswer,
}: FillBlankInputProps) {
  const stateClasses =
    state === "correct"
      ? "border-teal bg-teal-dim/10"
      : state === "incorrect"
        ? "border-red-400 bg-red-400/10"
        : "border-bone/15 focus-within:border-amber";

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-xl border px-5 py-4 transition-colors ${stateClasses}`}
      >
        {state === "correct" && <CheckCircle2 size={20} className="shrink-0 text-teal" />}
        {state === "incorrect" && <XCircle size={20} className="shrink-0 text-red-400" />}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer…"
          aria-label="Your answer"
          className="w-full bg-transparent text-bone outline-none placeholder:text-slate disabled:cursor-not-allowed"
        />
      </div>

      {state === "incorrect" && acceptedAnswer && (
        <p className="mt-2 text-sm text-slate">
          Accepted answer: <span className="font-semibold text-bone">{acceptedAnswer}</span>
        </p>
      )}
    </div>
  );
}
