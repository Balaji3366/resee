import type { Difficulty } from "@/types/learning";

export type PracticeQuestionType = "single_choice" | "multiple_select" | "true_false";
export type AttemptStatus = "in_progress" | "completed";
export type PracticeKind = "topic" | "mock_test";

export interface PracticeCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface PracticeOption {
  id: string;
  text: string;
}

export interface PracticeTopicSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  icon: string;
  isAvailable: boolean;
  category: PracticeCategory | null;
  questionCount: number;
  estimatedMinutes: number;
  bestScore: number | null;
  attemptsCount: number;
  inProgressAttemptId: string | null;
}

/** Question shape sent to the client BEFORE submission — no correct
 *  answers or explanations, those only come back in the attempt result. */
export interface PracticeQuestionPublic {
  id: string;
  question: string;
  questionType: PracticeQuestionType;
  options: PracticeOption[];
}

export interface PracticeAttemptSession {
  attemptId: string;
  status: AttemptStatus;
  questions: PracticeQuestionPublic[];
  answers: Record<string, string[]>;
  startedAt: string;
}

export interface PracticeAttemptQuestionResult {
  questionId: string;
  correct: boolean;
  correctOptionIds: string[];
  explanation: string;
}

export interface PracticeAttemptResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  accuracyPercent: number;
  timeTakenSeconds: number;
  results: PracticeAttemptQuestionResult[];
}

export interface ContinuePracticeItem {
  attemptId: string;
  kind: PracticeKind;
  slug: string;
  title: string;
  totalQuestions: number;
  questionsRemaining: number;
  progressPercent: number;
  startedAt: string;
}

export interface MockTestSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  durationMinutes: number;
  totalQuestions: number;
  isAvailable: boolean;
  bestScore: number | null;
  inProgressAttemptId: string | null;
}

export interface PracticeHistoryEntry {
  id: string;
  kind: PracticeKind;
  title: string;
  slug: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  attemptedAt: string;
}

export interface TopicAccuracy {
  topicTitle: string;
  accuracyPercent: number;
  questionsSolved: number;
}

export interface PracticeTrendPoint {
  periodStart: string;
  questionsSolved: number;
  accuracyPercent: number;
}

export interface PracticeAnalyticsData {
  totalQuestionsSolved: number;
  accuracyPercent: number;
  averageScore: number;
  totalPracticeMinutes: number;
  weakTopics: TopicAccuracy[];
  strongTopics: TopicAccuracy[];
  weekly: PracticeTrendPoint[];
  monthly: PracticeTrendPoint[];
}

export interface BookmarkedQuestion {
  id: string;
  question: string;
  questionType: PracticeQuestionType;
  options: PracticeOption[];
  correctOptionIds: string[];
  explanation: string;
  topicTitle: string;
  topicSlug: string;
  createdAt: string;
}
