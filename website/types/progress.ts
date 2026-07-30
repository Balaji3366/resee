export interface ProgressOverview {
  overallCompletionPercent: number;
  currentStreak: number;
  bestStreak: number;
  totalLearningHours: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  mockTestsCompleted: number;
  practiceQuestionsSolved: number;
  totalActiveDays: number;
  hasAnyActivity: boolean;
}

export interface DayActivityPoint {
  date: string;
  learningEvents: number;
  practiceEvents: number;
}

export interface MonthActivityPoint {
  monthStart: string;
  learningHours: number;
  practiceMinutes: number;
  completedCourses: number;
  completedModules: number;
}

export interface ProgressActivity {
  weekly: DayActivityPoint[];
  monthly: MonthActivityPoint[];
}

export interface SkillProgress {
  id: string;
  slug: string;
  name: string;
  icon: string;
  percent: number;
}

export interface ProgressSkillsData {
  skills: SkillProgress[];
  strengths: SkillProgress[];
  areasToImprove: SkillProgress[];
}

export interface AchievementStatus {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface MilestoneStatus {
  slug: string;
  title: string;
  achieved: boolean;
  comingSoon: boolean;
  achievedAt: string | null;
}

export type TimelineEventKind =
  | "lesson_completed"
  | "quiz_passed"
  | "mock_test_completed"
  | "course_completed"
  | "practice_completed";

export interface TimelineEntry {
  kind: TimelineEventKind;
  title: string;
  occurredAt: string;
}
