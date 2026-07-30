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

export interface AdminQuizQuestionDetail {
  id: string;
  question: string;
  questionType: "single_choice" | "multiple_select";
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
