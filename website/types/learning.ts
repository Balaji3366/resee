export type Difficulty = "beginner" | "intermediate" | "advanced";
export type QuestionType = "single_choice" | "multiple_select";

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

export interface ContinueLearningData {
  courseSlug: string;
  courseTitle: string;
  progressPercent: number;
  lastLessonTitle: string | null;
  resumeSlug: string;
  currentStreak: number;
}
