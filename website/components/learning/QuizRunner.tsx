"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import QuizOptionButton from "./QuizOptionButton";
import type { QuizSummary, QuizAttemptResult } from "@/types/learning";

interface QuizRunnerProps {
  courseSlug: string;
  quiz: QuizSummary;
  onPassed: () => void;
}

export default function QuizRunner({ courseSlug, quiz, onPassed }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  const questions = quiz.questions ?? [];

  function toggleOption(questionId: string, optionId: string, questionType: string) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];

      if (questionType === "single_choice") {
        return { ...prev, [questionId]: [optionId] };
      }

      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];

      return { ...prev, [questionId]: next };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/learning/courses/${courseSlug}/quizzes/${quiz.slug}/attempt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );

      const json = await res.json();

      if (json.success) {
        setResult(json);
        if (json.passed) onPassed();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setResult(null);
    setAnswers({});
  }

  const allAnswered = questions.every((q) => (answers[q.id] ?? []).length > 0);

  if (result) {
    return (
      <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
        <h2 className="font-display text-2xl font-bold text-bone">
          {result.passed ? "You passed! 🎉" : "Not quite — try again"}
        </h2>

        <p className="mt-2 text-slate">
          Score: {result.score}% (passing: {quiz.passingScore}%)
        </p>

        <div className="mt-6 space-y-4">
          {questions.map((q) => {
            const qResult = result.results.find((r) => r.questionId === q.id);
            const submitted = answers[q.id] ?? [];

            return (
              <div key={q.id} className="rounded-2xl border border-bone/10 p-5">
                <p className="font-semibold text-bone">{q.question}</p>

                <div className="mt-3 space-y-2">
                  {q.options.map((opt) => (
                    <QuizOptionButton
                      key={opt.id}
                      label={opt.text}
                      selected={submitted.includes(opt.id)}
                      state={
                        qResult?.correctOptionIds.includes(opt.id)
                          ? "correct"
                          : submitted.includes(opt.id)
                          ? "incorrect"
                          : "default"
                      }
                      onClick={() => {}}
                      disabled
                    />
                  ))}
                </div>

                <p className="mt-3 text-sm text-slate">{qResult?.explanation}</p>
              </div>
            );
          })}
        </div>

        {!result.passed && (
          <button
            onClick={handleRetry}
            className="mt-8 w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
          >
            Retry Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      <h2 className="font-display text-2xl font-bold text-bone">{quiz.title}</h2>

      <p className="mt-2 text-slate">
        Answer every question, then submit. You need {quiz.passingScore}% to pass.
      </p>

      <div className="mt-6 space-y-6">
        {questions.map((q, i) => (
          <div key={q.id}>
            <p className="font-semibold text-bone">
              {i + 1}. {q.question}
            </p>

            <div className="mt-3 space-y-2">
              {q.options.map((opt) => (
                <QuizOptionButton
                  key={opt.id}
                  label={opt.text}
                  selected={(answers[q.id] ?? []).includes(opt.id)}
                  onClick={() => toggleOption(q.id, opt.id, q.questionType)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="mt-8 w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </motion.button>
    </div>
  );
}
