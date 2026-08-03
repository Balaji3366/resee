"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import ProgressRing from "@/components/ui/ProgressRing";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import { downloadInterviewReportPdf } from "@/lib/interviewReportPdf";
import type { InterviewPostSessionEvaluationResult } from "@/lib/ai/prompts/interviewPostSessionEvaluation";

export default function InterviewEvaluationCard({
  attemptId,
  interviewTitle,
  evaluation,
  onGenerated,
}: {
  attemptId: string;
  interviewTitle: string;
  evaluation: InterviewPostSessionEvaluationResult | null;
  onGenerated: () => void;
}) {
  const enabled = useFeatureFlag("aiInterviewEvaluation");
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (!enabled) return null;

  async function handleRetry() {
    setRetrying(true);
    setRetryError(null);

    try {
      const res = await fetch(`/api/interviews/attempts/${attemptId}/evaluate`, { method: "POST" });
      const json = await res.json();

      if (json.success) {
        onGenerated();
      } else {
        setRetryError(json.message || json.error?.message || "Failed to generate evaluation.");
      }
    } finally {
      setRetrying(false);
    }
  }

  if (!evaluation) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-bone/15 bg-panel p-6 text-center">
        <p className="text-sm text-slate">
          AI evaluation isn&apos;t available for this session yet.
        </p>
        {retryError && <p className="mt-2 text-xs text-red-400">{retryError}</p>}
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="mt-3 rounded-xl border border-amber/30 px-5 py-2.5 text-sm font-semibold text-amber hover:bg-amber/10 disabled:opacity-50"
        >
          {retrying ? "Generating…" : "Generate AI Evaluation"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-amber/20 bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-bone">
          <Sparkles size={16} className="text-amber" />
          AI Post-Session Evaluation
        </h3>
        <AIDisclosureBadge />
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ProgressRing value={evaluation.overallScore} size={110} strokeWidth={10}>
          <div className="text-center">
            <p className="text-2xl font-bold text-bone">{evaluation.overallScore}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate">Overall</p>
          </div>
        </ProgressRing>

        <div className="grid flex-1 grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-ink p-3">
            <p className="text-lg font-bold text-bone">{evaluation.communicationScore}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate">Communication</p>
          </div>
          <div className="rounded-xl bg-ink p-3">
            <p className="text-lg font-bold text-bone">{evaluation.technicalScore}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate">Technical</p>
          </div>
          <div className="rounded-xl bg-ink p-3">
            <p className="text-lg font-bold text-bone">{evaluation.confidenceScore}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate">Confidence</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">Strengths</p>
          <ul className="space-y-1.5 text-sm text-bone">
            {evaluation.strengths.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">Weaknesses</p>
          <ul className="space-y-1.5 text-sm text-bone">
            {evaluation.weaknesses.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate">
          Improvement Suggestions
        </p>
        <ul className="space-y-1.5 text-sm text-bone">
          {evaluation.improvementSuggestions.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl bg-ink p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate">
          Overall Recommendations
        </p>
        <p className="text-sm text-bone">{evaluation.overallRecommendations}</p>
      </div>

      <button
        onClick={() => downloadInterviewReportPdf(evaluation, interviewTitle)}
        className="mt-6 rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
      >
        Export Report (PDF)
      </button>
    </div>
  );
}
