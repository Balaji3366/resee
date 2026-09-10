import {
  BarChart3,
  Bot,
  BookOpen,
  Briefcase,
  Cloud,
  Cog,
  Code2,
  FlaskConical,
  Landmark,
  type LucideIcon,
  MessagesSquare,
  Palette,
  Rocket,
} from "lucide-react";

/**
 * Learning categories/courses store an admin-editable emoji in `icon`
 * (see supabase/migrations/0003b_learning_module_seed.sql), but raw emoji
 * render inconsistently across platforms and clash with the lucide
 * line-icons used everywhere else in the UI (see DashboardSidebar.tsx).
 * This maps known slugs to a matching lucide icon for display instead —
 * scoped to the Learning page only, the emoji field itself is untouched.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  programming: Code2,
  testing: FlaskConical,
  cloud: Cloud,
  ai: Bot,
  "soft-skills": MessagesSquare,
  "government-exams": Landmark,
  "career-skills": Briefcase,
};

const COURSE_ICONS: Record<string, LucideIcon> = {
  "full-stack-development": Rocket,
  "qa-automation": FlaskConical,
  "data-analytics": BarChart3,
  "ai-engineering": Bot,
  devops: Cog,
  "ui-ux-design": Palette,
  "government-exam-prep": Landmark,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}

export function getCourseIcon(slug: string): LucideIcon {
  return COURSE_ICONS[slug] ?? BookOpen;
}
