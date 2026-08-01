"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import QuizOptionButton from "./QuizOptionButton";
import FillBlankInput from "./FillBlankInput";
import type { CourseExamSummary, ExamAttemptResult } from "@/types/learning";

interface CourseExamRunnerProps {
  courseSlug: string;
  exam: CourseExamSummary;
}

/**
 * Course-level final exam runner — same submit-all-at-once shape as
 * QuizRunner.tsx (reusing QuizOptionButton/FillBlankInput), but exam
 * semantics differ enough from a per-module quiz (no "unlocks the next
 * module" concept; passing can issue a course certificate) that this is
 * its own component rather than overloading QuizRunner's result type.
 */
export default function CourseExamRunner({ courseSlug, exam }: CourseExamRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamAttemptResult | null>(null);

  const questions = exam.questions ?? [];

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

  function setTextAnswer(questionId: string, text: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: [text] }));
  }

  async function handleSubmit() {
    setSubmitting(true);

    try {
      const res = await fetch(`/api/learning/courses/${courseSlug}/exam/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const json = await res.json();
      if (json.success) setResult(json);
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setResult(null);
    setAnswers({});
  }

  const allAnswered = questions.every((q) => {
    const given = answers[q.id] ?? [];
    return q.questionType === "fill_blank" ? (given[0] ?? "").trim().length > 0 : given.length > 0;
  });

  if (result) {
    return (
      <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
        <h2 className="font-display text-2xl font-bold text-bone">
          {result.passed ? "You passed the final exam! 🎓" : "Not quite — try again"}
        </h2>

        <p className="mt-2 text-slate">
          Score: {result.score}% (passing: {exam.passingScore}%)
        </p>

        {result.passed && result.certificateNumber && (
          <div className="mt-6 rounded-2xl border border-amber/20 bg-panel-2/40 p-6">
            <p className="font-semibold text-bone">Your certificate is ready.</p>
            <p className="mt-1 text-sm text-slate">Certificate No. {result.certificateNumber}</p>

            <Link
              href={`/learning/${courseSlug}/certificate`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim"
            >
              View Certificate
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {questions.map((q) => {
            const qResult = result.results.find((r) => r.questionId === q.id);
            const submitted = answers[q.id] ?? [];

            return (
              <div key={q.id} className="rounded-2xl border border-bone/10 p-5">
                <p className="font-semibold text-bone">{q.question}</p>

                <div className="mt-3 space-y-2">
                  {q.questionType === "fill_blank" ? (
                    <FillBlankInput
                      value={submitted[0] ?? ""}
                      onChange={() => {}}
                      disabled
                      state={qResult?.correct ? "correct" : "incorrect"}
                      acceptedAnswer={qResult?.correctOptionIds[0]}
                    />
                  ) : (
                    q.options.map((opt) => (
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
                    ))
                  )}
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
            Retry Exam
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      <h2 className="font-display text-2xl font-bold text-bone">{exam.title}</h2>

      <p className="mt-2 text-slate">
        Answer every question, then submit. You need {exam.passingScore}% to pass and earn your
        course certificate.
      </p>

      <div className="mt-6 space-y-6">
        {questions.map((q, i) => (
          <div key={q.id}>
            <p className="font-semibold text-bone">
              {i + 1}. {q.question}
            </p>

            <div className="mt-3 space-y-2">
              {q.questionType === "fill_blank" ? (
                <FillBlankInput
                  value={(answers[q.id] ?? [])[0] ?? ""}
                  onChange={(text) => setTextAnswer(q.id, text)}
                />
              ) : (
                q.options.map((opt) => (
                  <QuizOptionButton
                    key={opt.id}
                    label={opt.text}
                    selected={(answers[q.id] ?? []).includes(opt.id)}
                    onClick={() => toggleOption(q.id, opt.id, q.questionType)}
                  />
                ))
              )}
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
        {submitting ? "Submitting..." : "Submit Final Exam"}
      </motion.button>
    </div>
  );
}
