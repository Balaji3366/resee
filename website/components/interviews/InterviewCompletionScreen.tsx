import Link from "next/link";
import { CheckCircle2, ListChecks, Clock, ClipboardCheck } from "lucide-react";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import type { InterviewAttemptResult, InterviewQuestionPublic } from "@/types/interview";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function InterviewCompletionScreen({
  result,
  questions,
  answers,
  onRestart,
}: {
  result: InterviewAttemptResult;
  questions: InterviewQuestionPublic[];
  answers: Record<string, string>;
  onRestart: () => void;
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      <h2 className="font-display text-2xl font-bold text-bone">Interview complete 🎉</h2>
      <p className="mt-2 text-slate">
        Nice work. Here&apos;s a summary of your session — no AI feedback yet, just an honest record of
        what you covered.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PracticeStatTile label="Total Questions" value={String(result.totalQuestions)} icon={ListChecks} />
        <PracticeStatTile
          label="Completed"
          value={String(result.completedQuestions)}
          icon={ClipboardCheck}
        />
        <PracticeStatTile label="Time Taken" value={formatTime(result.timeTakenSeconds)} icon={Clock} />
        <PracticeStatTile label="Status" value="Completed" icon={CheckCircle2} />
      </div>

      <div className="mt-8 space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="rounded-2xl border border-bone/10 p-5">
            <p className="font-semibold text-bone">{q.question}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate">
              {answers[q.id]?.trim() ? answers[q.id] : "No answer given."}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onRestart}
          className="flex-1 rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
        >
          Practice Again
        </button>

        <Link
          href="/interviews"
          className="flex-1 rounded-xl border border-bone/15 py-4 text-center text-lg font-bold text-bone transition hover:border-amber"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
