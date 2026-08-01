export type Difficulty = "beginner" | "intermediate" | "advanced";
export type QuestionType = "single_choice" | "multiple_select" | "fill_blank";

export interface LearningCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  difficulty: Difficulty;
  icon: string;
  isAvailable: boolean;
  category: LearningCategory | null;
  moduleCount: number;
  lessonCount: number;
  totalMinutes: number;
  isEnrolled: boolean;
  progressPercent: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

/** Question shape sent to the client BEFORE submission — no correct
 *  answers or explanations, those only come back in the attempt result. */
export interface QuizQuestionPublic {
  id: string;
  question: string;
  questionType: QuestionType;
  options: QuizOption[];
}

export interface QuizSummary {
  id: string;
  slug: string;
  title: string;
  passingScore: number;
  estimatedMinutes: number;
  passed: boolean;
  bestScore: number | null;
  questions: QuizQuestionPublic[] | null;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
  content: string | null;
  keyTakeaways: string[] | null;
  videoUrl: string | null;
}

export interface ModuleSummary {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  unlocked: boolean;
  lessons: LessonSummary[];
  quiz: QuizSummary | null;
}

/** Course-level final exam — one optional exam per course, gated on
 *  every module being complete (see lib/learningAccess.ts). Same shape
 *  as QuizSummary, scoped to a course instead of a module. */
export interface CourseExamSummary {
  id: string;
  slug: string;
  title: string;
  passingScore: number;
  estimatedMinutes: number;
  passed: boolean;
  questions: QuizQuestionPublic[] | null;
}

export interface CourseCertificate {
  certificateNumber: string;
  issuedAt: string;
}

export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  difficulty: Difficulty;
  icon: string;
  isAvailable: boolean;
  totalLessons: number;
  totalMinutes: number;
  isEnrolled: boolean;
  progressPercent: number;
  modules: ModuleSummary[];
  /** null when this course has no final exam configured. */
  exam: CourseExamSummary | null;
  /** All modules complete (and exam passed, if one exists). */
  isComplete: boolean;
  /** null until issued — see /api/learning/courses/[slug]/certificate. */
  certificate: CourseCertificate | null;
}

export interface QuizAttemptQuestionResult {
  questionId: string;
  correct: boolean;
  correctOptionIds: string[];
  explanation: string;
}

export interface QuizAttemptResult {
  score: number;
  passed: boolean;
  results: QuizAttemptQuestionResult[];
  nextModuleUnlocked: boolean;
}

export interface ExamAttemptResult {
  score: number;
  passed: boolean;
  results: QuizAttemptQuestionResult[];
  certificateIssued: boolean;
  certificateNumber: string | null;
}

export interface ContinueLearningData {
  courseSlug: string;
  courseTitle: string;
  progressPercent: number;
  lastLessonTitle: string | null;
  resumeSlug: string;
  currentStreak: number;
}
