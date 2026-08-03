import Link from "next/link";
import { CheckCircle2, ListChecks, Clock, ClipboardCheck } from "lucide-react";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import InterviewEvaluationCard from "@/components/interviews/ai/InterviewEvaluationCard";
import DeepAnalysisSection from "@/components/interviews/ai/DeepAnalysisSection";
import { useInterviewAnalyses } from "@/hooks/useInterviewAnalyses";
import type { InterviewAttemptResult, InterviewQuestionPublic } from "@/types/interview";
import type { InterviewPostSessionEvaluationResult } from "@/lib/ai/prompts/interviewPostSessionEvaluation";
import type { InterviewFeedbackResult } from "@/lib/ai/prompts/interviewFeedback";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function InterviewCompletionScreen({
  attemptId,
  interviewTitle,
  result,
  questions,
  answers,
  onRestart,
}: {
  attemptId: string;
  interviewTitle: string;
  result: InterviewAttemptResult;
  questions: InterviewQuestionPublic[];
  answers: Record<string, string>;
  onRestart: () => void;
}) {
  const { data: analyses, refetch } = useInterviewAnalyses(attemptId);

  const evaluation =
    (analyses?.find((a) => a.feature === "interview_evaluation")
      ?.result as InterviewPostSessionEvaluationResult) ?? null;

  const deepAnalysesByQuestion = new Map(
    (analyses ?? [])
      .filter((a) => a.feature === "interview_deep_analysis" && a.questionId)
      .map((a) => [a.questionId as string, a.result as InterviewFeedbackResult])
  );

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
      <h2 className="font-display text-2xl font-bold text-bone">Interview Completed.</h2>
      <p className="mt-2 text-slate">
        Nice work. Here&apos;s a summary of your session, along with any AI evaluation available for
        it.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <PracticeStatTile
          label="Total Questions"
          value={String(result.totalQuestions)}
          icon={ListChecks}
        />
        <PracticeStatTile
          label="Questions Answered"
          value={String(result.completedQuestions)}
          icon={ClipboardCheck}
        />
        <PracticeStatTile
          label="Total Time"
          value={formatTime(result.timeTakenSeconds)}
          icon={Clock}
        />
        <PracticeStatTile label="Status" value="Completed" icon={CheckCircle2} />
      </div>

      <InterviewEvaluationCard
        attemptId={attemptId}
        interviewTitle={interviewTitle}
        evaluation={evaluation}
        onGenerated={refetch}
      />

      <div className="mt-8 space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="rounded-2xl border border-bone/10 p-5">
            <p className="font-semibold text-bone">{q.question}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate">
              {answers[q.id]?.trim() ? answers[q.id] : "No answer given."}
            </p>

            <DeepAnalysisSection
              attemptId={attemptId}
              questionId={q.id}
              hasAnswer={Boolean(answers[q.id]?.trim())}
              existingResult={deepAnalysesByQuestion.get(q.id) ?? null}
              onGenerated={refetch}
            />
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
          Done
        </Link>
      </div>
    </div>
  );
}
