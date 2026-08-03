"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import type { InterviewFeedbackResult } from "@/lib/ai/prompts/interviewFeedback";

export default function DeepAnalysisSection({
  attemptId,
  questionId,
  hasAnswer,
  existingResult,
  onGenerated,
}: {
  attemptId: string;
  questionId: string;
  hasAnswer: boolean;
  existingResult: InterviewFeedbackResult | null;
  onGenerated: () => void;
}) {
  const enabled = useFeatureFlag("aiInterviewEvaluation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled || !hasAnswer) return null;

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/interviews/attempts/${attemptId}/deep-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const json = await res.json();

      if (json.success) {
        onGenerated();
      } else {
        setError(json.message || json.error?.message || "Failed to analyze this answer.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!existingResult) {
    return (
      <div className="mt-3">
        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10 disabled:opacity-50"
        >
          <Sparkles size={13} />
          {loading ? "Analyzing…" : "Deep AI Analysis"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-amber/20 bg-ink p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-bone">Score: {existingResult.score}/100</p>
        <AIDisclosureBadge />
      </div>

      {existingResult.strengths.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate">Strengths</p>
          <ul className="mt-1 space-y-0.5 text-sm text-bone">
            {existingResult.strengths.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}

      {existingResult.improvements.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate">Improvements</p>
          <ul className="mt-1 space-y-0.5 text-sm text-bone">
            {existingResult.improvements.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-2 text-xs text-slate">{existingResult.modelAnswerNotes}</p>
    </div>
  );
}
