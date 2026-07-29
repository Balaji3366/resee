export type SubMetricKey =
  | "resumeQuality"
  | "technicalSkills"
  | "interviewReadiness"
  | "learningProgress"
  | "projectPortfolio"
  | "jobReadiness";

export interface SubMetric {
  score: number | null;
  status: "ready" | "not_started";
  cta?: { label: string; href: string };
}

export type OverallStatus = "computed" | "baseline" | "insufficient_data";

export interface CareerScoreResult {
  overall: number | null;
  overallStatus: OverallStatus;
  subMetrics: Record<SubMetricKey, SubMetric>;
}

export interface CareerScoreInput {
  /** Most recent resume_history.ats_score, if any resume has been analyzed. */
  latestAtsScore: number | null;
  /** Total number of resume_history rows for this user. */
  resumeCount: number;
  /** One-time onboarding estimate: profiles.ai_summary.careerHealthScore. */
  onboardingScore: number | null;
}

/**
 * Composite score = simple average of every sub-metric that has real,
 * measured data ("ready"). Sub-metrics with no backing feature yet stay
 * "not_started" and never contribute a fabricated number. When no
 * sub-metric is ready yet, fall back to the one-time onboarding estimate
 * as a clearly-labeled baseline; with neither, there isn't enough data
 * to show anything.
 */
export function computeCareerScore(input: CareerScoreInput): CareerScoreResult {
  const { latestAtsScore, resumeCount, onboardingScore } = input;

  const subMetrics: Record<SubMetricKey, SubMetric> = {
    resumeQuality:
      resumeCount > 0
        ? { score: latestAtsScore, status: "ready" }
        : {
            score: null,
            status: "not_started",
            cta: { label: "Analyze your resume", href: "/resume" },
          },
    technicalSkills: {
      score: null,
      status: "not_started",
      cta: { label: "Take a practice quiz", href: "/quiz" },
    },
    interviewReadiness: {
      score: null,
      status: "not_started",
      cta: { label: "Practice interview questions", href: "/documents" },
    },
    learningProgress: { score: null, status: "not_started" },
    projectPortfolio: { score: null, status: "not_started" },
    jobReadiness: { score: null, status: "not_started" },
  };

  const readyScores = Object.values(subMetrics)
    .filter((metric) => metric.status === "ready" && metric.score !== null)
    .map((metric) => metric.score as number);

  if (readyScores.length > 0) {
    const average =
      readyScores.reduce((sum, score) => sum + score, 0) / readyScores.length;

    return {
      overall: Math.round(average),
      overallStatus: "computed",
      subMetrics,
    };
  }

  if (onboardingScore !== null) {
    return {
      overall: onboardingScore,
      overallStatus: "baseline",
      subMetrics,
    };
  }

  return {
    overall: null,
    overallStatus: "insufficient_data",
    subMetrics,
  };
}
