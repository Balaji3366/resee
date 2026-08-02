import type { Difficulty } from "@/types/learning";
import type { AdminRole } from "@/lib/adminAuth";

export type { AdminRole };

export type CourseStatus = "draft" | "published" | "archived";

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface AdminCourseSummary {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  status: CourseStatus;
  isAvailable: boolean;
  category: AdminCategory | null;
  moduleCount: number;
  lessonCount: number;
  updatedAt: string;
}

export interface AdminAttachment {
  name: string;
  url: string;
}

export interface AdminLessonDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  keyTakeaways: string[];
  estimatedMinutes: number;
  sortOrder: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  notes: string | null;
  attachments: AdminAttachment[];
}

export type AdminQuestionType = "single_choice" | "multiple_select" | "true_false" | "fill_blank";

export interface AdminQuizQuestionDetail {
  id: string;
  question: string;
  questionType: AdminQuestionType;
  /** Acceptable-answers list when questionType is "fill_blank"; option
   *  choices otherwise — see AdminQuestionEditor.tsx. */
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation: string;
  difficulty: string | null;
  marks: number;
  timeLimitSeconds: number | null;
  sortOrder: number;
}

export interface AdminQuizDetail {
  id: string;
  slug: string;
  title: string;
  passingScore: number;
  estimatedMinutes: number;
  questions: AdminQuizQuestionDetail[];
}

export interface AdminModuleDetail {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: AdminLessonDetail[];
  quiz: AdminQuizDetail | null;
}

export interface AdminCourseDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  difficulty: Difficulty;
  icon: string;
  status: CourseStatus;
  isAvailable: boolean;
  bannerUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  category: AdminCategory | null;
  modules: AdminModuleDetail[];
}

// ============================================================
// Admin CMS — Practice & Assessment (extends the Learning CMS pattern
// above to the previously-unmanaged practice_categories/practice_topics/
// practice_questions/mock_tests/mock_test_questions tables — see
// docs/standards/design-system.md).
// ============================================================

export interface AdminPracticeCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface AdminPracticeTopicSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  isAvailable: boolean;
  category: AdminPracticeCategory | null;
  questionCount: number;
  updatedAt: string;
}

export interface AdminPracticeQuestionDetail {
  id: string;
  question: string;
  questionType: AdminQuestionType;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation: string;
  sortOrder: number;
}

export interface AdminPracticeTopicDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  icon: string;
  isAvailable: boolean;
  estimatedMinutes: number;
  category: AdminPracticeCategory | null;
  questions: AdminPracticeQuestionDetail[];
}

export interface AdminMockTestSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  isAvailable: boolean;
  durationMinutes: number;
  questionCount: number;
}

export interface AdminMockTestQuestionLink {
  linkId: string;
  questionId: string;
  question: string;
  topicTitle: string;
  sortOrder: number;
}

export interface AdminMockTestDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  durationMinutes: number;
  isAvailable: boolean;
  questions: AdminMockTestQuestionLink[];
}

// ============================================================
// Admin CMS — Course-level final exams
// ============================================================

export interface AdminCourseExamDetail {
  id: string;
  slug: string;
  title: string;
  passingScore: number;
  estimatedMinutes: number;
  questions: AdminQuizQuestionDetail[];
}

// ============================================================
// Admin CMS — Mock Interview content (previously seed-SQL only, same
// gap Practice had before its CMS was built — see docs/standards/design-system.md)
// ============================================================

export interface AdminInterviewCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  sortOrder: number;
}

export interface AdminInterviewRole {
  id: string;
  slug: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface AdminInterviewSetSummary {
  id: string;
  slug: string;
  title: string;
  experienceLevel: string;
  isAvailable: boolean;
  category: AdminInterviewCategory | null;
  role: AdminInterviewRole | null;
  questionCount: number;
}

export interface AdminInterviewQuestionDetail {
  id: string;
  question: string;
  questionType: "short_text" | "long_text";
  sortOrder: number;
}

export interface AdminInterviewSetDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  experienceLevel: string;
  isAvailable: boolean;
  estimatedMinutes: number;
  category: AdminInterviewCategory | null;
  role: AdminInterviewRole | null;
  questions: AdminInterviewQuestionDetail[];
}

// ============================================================
// Admin CMS — Jobs (previously seed-SQL only — flat catalog, no
// nested categories/modules like Learning/Practice/Interviews have)
// ============================================================

export interface AdminJobSummary {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  jobType: string;
  experienceLevel: string;
  isAvailable: boolean;
  postedAt: string;
}

export interface AdminJobDetail {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  roleSlug: string | null;
  workMode: string;
  jobType: string;
  experienceLevel: string;
  experienceMinYears: number | null;
  experienceMaxYears: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  description: string;
  responsibilities: string[];
  eligibility: string[];
  applyUrl: string | null;
  isAvailable: boolean;
}

// ============================================================
// Admin AI Dashboard (AI Phase 0 — platform foundation, no AI feature
// UI yet; this observes the orchestration layer itself)
// ============================================================

export interface AdminAIStatusBreakdown {
  success: number;
  error: number;
  rate_limited: number;
  cached: number;
}

export interface AdminAIFeatureCount {
  feature: string;
  count: number;
}

export interface AdminAIPlanCount {
  plan: string;
  count: number;
}

export interface AdminAIStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisWeek: number;
  statusBreakdown: AdminAIStatusBreakdown;
  totalTokens: number;
  avgLatencyMs: number | null;
  requestsByFeature: AdminAIFeatureCount[];
  requestsTrend: AdminTrendPoint[];
  errorTrend: AdminTrendPoint[];
  creditsGranted: number;
  creditsSpent: number;
  usersByPlan: AdminAIPlanCount[];
}

export interface AdminAIRequestLogEntry {
  id: string;
  userId: string;
  feature: string;
  provider: string;
  model: string;
  status: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  latencyMs: number | null;
  errorMessage: string | null;
  paramsRedacted: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminTrendPoint {
  periodStart: string;
  count: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  learningPathsPublished: number;
  learningPathsTotal: number;
  totalEnrollments: number;
  quizCompletions: number;
  userGrowth: AdminTrendPoint[];
  learningActivity: AdminTrendPoint[];
  quizCompletionRate: { periodStart: string; passed: number; failed: number }[];
}
