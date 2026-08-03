import { useCallback, useEffect, useState } from "react";
import type { InterviewPostSessionEvaluationResult } from "@/lib/ai/prompts/interviewPostSessionEvaluation";
import type { InterviewFeedbackResult } from "@/lib/ai/prompts/interviewFeedback";

export type InterviewAnalysisEntry = {
  id: string;
  feature: "interview_evaluation" | "interview_deep_analysis";
  questionId: string | null;
  result: InterviewPostSessionEvaluationResult | InterviewFeedbackResult;
  createdAt: string;
};

/** Same hand-rolled fetch pattern as useResumeAnalyses — matches this
 *  project's established hook convention rather than introducing a
 *  different data-fetching approach for the one new AI-history hook. */
export function useInterviewAnalyses(attemptId: string) {
  const [data, setData] = useState<InterviewAnalysisEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/interviews/attempts/${attemptId}/analyses`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load interview analysis history.");
      }

      setData(json.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview analysis history.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
