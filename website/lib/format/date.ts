/**
 * Consolidates the two `formatDate` variants found duplicated across the
 * codebase: a long form (components/interviews/InterviewHistoryList.tsx,
 * components/practice/PracticeHistoryList.tsx, and inline in
 * components/progress/{AchievementBadgeGrid,MilestonesSection}.tsx) and
 * a short chart-axis form (components/admin/AdminTrendChart.tsx,
 * components/CareerScoreTimeline.tsx,
 * components/practice/PracticeTrendChart.tsx,
 * components/progress/WeeklyActivityChart.tsx). Those existing call
 * sites are not migrated in this pass — this is the shared utility new
 * code should use going forward.
 */

/** "Jul 28, 2026" — the long-form variant. */
export function formatDateLong(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Jul 28" — the short chart-axis variant, no year. */
export function formatDateShort(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "3 days ago" / "in 2 hours" — relative time, genuinely new (no existing equivalent). */
export function formatRelativeTime(value: string | Date): string {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);

  const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }

  return formatter.format(diffSeconds, "second");
}
