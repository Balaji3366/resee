export type InterviewQuestionType = "short_text" | "long_text";
export type InterviewDifficulty = "beginner" | "intermediate" | "advanced";
export type InterviewAttemptStatus = "in_progress" | "completed";

export interface InterviewCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
}

export interface InterviewRole {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface InterviewSetSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: InterviewCategory;
  role: InterviewRole;
  difficulty: InterviewDifficulty;
  estimatedMinutes: number;
  isAvailable: boolean;
  questionCount: number;
  completedCount: number;
  inProgressAttemptId: string | null;
  lastCompletedAt: string | null;
}

/** Question shape sent to the client — no secret data exists for these
 *  open-ended prompts, so this is also exactly what's stored. */
export interface InterviewQuestionPublic {
  id: string;
  question: string;
  questionType: InterviewQuestionType;
  sortOrder: number;
}

export interface InterviewAttemptSession {
  attemptId: string;
  status: InterviewAttemptStatus;
  questions: InterviewQuestionPublic[];
  answers: Record<string, string>;
  startedAt: string;
}

export interface InterviewAttemptResult {
  totalQuestions: number;
  completedQuestions: number;
  timeTakenSeconds: number;
  completionStatus: InterviewAttemptStatus;
}

export interface ContinueInterviewItem {
  attemptId: string;
  slug: string;
  title: string;
  totalQuestions: number;
  questionsRemaining: number;
  progressPercent: number;
  startedAt: string;
}

export interface InterviewHistoryEntry {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  roleName: string;
  difficulty: InterviewDifficulty;
  totalQuestions: number;
  completedQuestions: number;
  timeTakenSeconds: number;
  completedAt: string;
}

export interface InterviewAnswerReview {
  questionId: string;
  question: string;
  questionType: InterviewQuestionType;
  sortOrder: number;
  answer: string;
}

export interface InterviewHistoryDetail {
  id: string;
  title: string;
  completedAt: string;
  timeTakenSeconds: number;
  answers: InterviewAnswerReview[];
}

export interface InterviewPerformanceData {
  interviewsCompleted: number;
  totalPracticeSeconds: number;
  currentStreak: number;
  categoriesAttempted: number;
  rolesPractised: number;
}
