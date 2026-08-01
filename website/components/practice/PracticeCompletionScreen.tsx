import QuizOptionButton from "@/components/learning/QuizOptionButton";
import FillBlankInput from "@/components/learning/FillBlankInput";
import type { PracticeAttemptResult, PracticeQuestionPublic } from "@/types/practice";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function PracticeCompletionScreen({
  result,
  questions,
  answers,
  onRestart,
  restartLabel = "Practice Again",
}: {
  result: PracticeAttemptResult;
  questions: PracticeQuestionPublic[];
  answers: Record<string, string[]>;
  onRestart: () => void;
  restartLabel?: string;
}) {
  const incorrectCount = result.totalQuestions - result.correctCount;

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      <h2 className="font-display text-2xl font-bold text-bone">Session complete 🎉</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-panel-2 p-4 text-center">
          <p className="text-2xl font-extrabold text-bone">{result.score}%</p>
          <p className="mt-1 text-xs font-semibold text-slate">Score</p>
        </div>

        <div className="rounded-2xl bg-panel-2 p-4 text-center">
          <p className="text-2xl font-extrabold text-teal">{result.correctCount}</p>
          <p className="mt-1 text-xs font-semibold text-slate">Correct</p>
        </div>

        <div className="rounded-2xl bg-panel-2 p-4 text-center">
          <p className="text-2xl font-extrabold text-red-400">{incorrectCount}</p>
          <p className="mt-1 text-xs font-semibold text-slate">Incorrect</p>
        </div>

        <div className="rounded-2xl bg-panel-2 p-4 text-center">
          <p className="text-2xl font-extrabold text-bone">{formatTime(result.timeTakenSeconds)}</p>
          <p className="mt-1 text-xs font-semibold text-slate">Time Taken</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
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

              {qResult?.explanation && (
                <p className="mt-3 text-sm text-slate">{qResult.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onRestart}
        className="mt-8 w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
      >
        {restartLabel}
      </button>
    </div>
  );
}
