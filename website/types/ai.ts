export type AIFeature =
  | "resume_analysis"
  | "resume_rewrite"
  | "job_match"
  | "interview_evaluation"
  | "career_roadmap"
  | "skill_gap"
  | "career_coaching"
  | "learning_recommendation"
  | "daily_recommendation"
  // Legacy, freeform (non-orchestrator) routes — distinct from the typed
  // feature set above so future Phase 1+ features never get confused with
  // the disconnected legacy tools they'll eventually replace.
  | "legacy_resume_analyzer"
  | "legacy_resume_rewrite"
  | "legacy_onboarding_summary"
  | "legacy_interview_questions"
  | "legacy_quiz_generator"
  | "legacy_quiz_file_generator"
  | "legacy_pdf_summarizer"
  | "legacy_pdf_chat"
  | "legacy_chat_assistant"
  // Resume Intelligence (AI Phase 1) — granular capabilities beyond the
  // original resume_analysis/resume_rewrite pair, all flowing through the
  // same runAIRequest() orchestrator, never a second orchestration path.
  | "resume_bullet_improvement"
  | "resume_version_comparison";

export type AIRequestStatus = "success" | "error" | "rate_limited" | "cached";

export type AIErrorCode =
  "rate_limited" | "invalid_request" | "provider_error" | "parse_error" | "no_credits" | "unknown";

export interface AIError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
}

export type AIResponse<T> =
  | { success: true; data: T; requestId: string; cached?: boolean }
  | { success: false; error: AIError };

// ============================================================
// User Context Engine
// ============================================================

export interface UserContextResume {
  title: string;
  templateSlug: string;
  fullName: string;
  skills: string[];
  experienceCount: number;
  educationCount: number;
  updatedAt: string;
}

export interface UserContextSkill {
  slug: string;
  name: string;
  percent: number;
}

export interface UserContextLearning {
  completedCourseCount: number;
  overallCompletionPercent: number;
  totalLearningMinutes: number;
  currentStreak: number;
  longestStreak: number;
  distinctActiveDays: number;
}

export interface UserContextPractice {
  totalQuestionsSolved: number;
  accuracyPercent: number;
  weakTopics: string[];
  strongTopics: string[];
}

export interface UserContextInterviews {
  completedCount: number;
  recentResults: { title: string; completedAt: string; questionsAnswered: number }[];
}

export interface UserContextJobs {
  savedJobCount: number;
  savedJobRoles: string[];
  applicationCount: number;
  applicationsByStatus: Record<string, number>;
}

/**
 * Legacy pre-onboarding-pivot profile fields — still present on the
 * `profiles` table but unreferenced by any current feature. Kept here
 * rather than silently dropped, since early users' real historical data
 * lives in them.
 */
export interface UserContextLegacyProfile {
  education: string | null;
  experience: string | null;
  currentSkills: string | null;
  dreamCompany: string | null;
  dreamSalary: string | null;
  interests: string | null;
}

export interface UserContext {
  userId: string;
  careerGoal: string | null;
  targetCareer: string | null;
  roleType: string | null;
  skillLevel: string | null;
  resume: UserContextResume | null;
  skills: UserContextSkill[];
  learning: UserContextLearning;
  practice: UserContextPractice;
  interviews: UserContextInterviews;
  jobs: UserContextJobs;
  legacyProfile: UserContextLegacyProfile;
  builtAt: string;
}

// ============================================================
// AI Memory (context snapshot cache, not chat history)
// ============================================================

export interface AIMemorySnapshot {
  careerGoal: string | null;
  preferredRole: string | null;
  skillLevel: string | null;
  learningProgressSummary: {
    completedCourseCount: number;
    overallCompletionPercent: number;
    currentStreak: number;
  } | null;
  contextSnapshot: UserContext | null;
  refreshedAt: string;
}

// ============================================================
// Credits & Subscription
// ============================================================

export type SubscriptionPlanSlug = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "trialing";

export interface SubscriptionPlan {
  id: string;
  slug: SubscriptionPlanSlug;
  name: string;
  monthlyCredits: number | null; // null = unlimited
  priceUsdCents: number | null;
  features: string[];
  isAvailable: boolean;
}

export interface UserSubscription {
  userId: string;
  planSlug: SubscriptionPlanSlug;
  status: SubscriptionStatus;
  creditsRemaining: number | null; // null = unlimited
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  feature: AIFeature | null;
  balanceAfter: number | null;
  createdAt: string;
}
