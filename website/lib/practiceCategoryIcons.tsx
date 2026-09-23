import {
  BookOpen,
  Brain,
  Calculator,
  Code2,
  Database,
  FlaskConical,
  GitBranch,
  Landmark,
  Laptop2,
  type LucideIcon,
  MessagesSquare,
} from "lucide-react";

/**
 * Practice categories/topics store an admin-editable emoji in `icon` (see
 * supabase/migrations/0004b_practice_module_seed.sql), but raw emoji render
 * inconsistently across platforms and clash with the lucide line-icons used
 * everywhere else in the UI (see lib/learningIcons.tsx for the same pattern
 * on the Learning page). This is the single source of truth for the Practice
 * page's icon + accent-color system — every category/topic card on that page
 * should go through these lookups instead of rendering `icon` fields or
 * defining its own icon, so a given category always looks the same
 * everywhere. The emoji fields themselves are untouched.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  aptitude: Calculator,
  programming: Laptop2,
  "qa-testing": FlaskConical,
  "data-structures": GitBranch,
  sql: Database,
  "ai-basics": Brain,
  communication: MessagesSquare,
  "government-exams": Landmark,
};

export type PracticeAccentTone =
  "amber" | "blue" | "green" | "purple" | "teal" | "pink" | "indigo" | "slateBlue" | "neutral";

/** Light tinted-circle badge classes per tone — muted, not neon. */
const ACCENT_CLASSES: Record<PracticeAccentTone, { bg: string; text: string }> = {
  amber: { bg: "bg-orange-500/10", text: "text-orange-600" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-600" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-600" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-600" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600" },
  slateBlue: { bg: "bg-slate-500/10", text: "text-slate-600" },
  neutral: { bg: "bg-panel-2", text: "text-slate" },
};

const CATEGORY_ACCENTS: Record<string, PracticeAccentTone> = {
  aptitude: "amber",
  programming: "blue",
  "qa-testing": "green",
  "data-structures": "purple",
  sql: "teal",
  "ai-basics": "pink",
  communication: "indigo",
  "government-exams": "slateBlue",
};

/**
 * Per-topic overrides — a topic normally inherits its category's icon/accent
 * (e.g. "SQL Joins & Queries" just uses the sql category's Database/teal),
 * but a few topics need their own identity distinct from their category,
 * namely individual programming languages under the "programming" category.
 */
const TOPIC_OVERRIDES: Record<string, { icon: LucideIcon; accent: PracticeAccentTone }> = {
  "javascript-fundamentals": { icon: Code2, accent: "blue" },
  "python-basics": { icon: Code2, accent: "green" },
};

export function getPracticeCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}

export function getPracticeCategoryAccent(slug: string): { bg: string; text: string } {
  return ACCENT_CLASSES[CATEGORY_ACCENTS[slug] ?? "neutral"];
}

export function getPracticeTopicIcon(topicSlug: string, categorySlug?: string | null): LucideIcon {
  return TOPIC_OVERRIDES[topicSlug]?.icon ?? getPracticeCategoryIcon(categorySlug ?? "");
}

export function getPracticeTopicAccent(
  topicSlug: string,
  categorySlug?: string | null
): { bg: string; text: string } {
  const override = TOPIC_OVERRIDES[topicSlug];
  return ACCENT_CLASSES[override?.accent ?? CATEGORY_ACCENTS[categorySlug ?? ""] ?? "neutral"];
}
