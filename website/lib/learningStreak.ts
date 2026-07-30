export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Pure streak update: given the user's current streak state and today's
 * date (server-computed, YYYY-MM-DD), returns the new state. Same-day
 * activity is a no-op; a gap of exactly one day extends the streak;
 * any larger gap resets it to 1.
 */
export function computeStreakUpdate(
  prev: StreakState,
  todayISODate: string = toISODate(new Date())
): StreakState {
  if (prev.lastActivityDate === todayISODate) {
    return prev;
  }

  const yesterday = new Date(todayISODate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISODate = toISODate(yesterday);

  const newCurrentStreak =
    prev.lastActivityDate === yesterdayISODate ? prev.currentStreak + 1 : 1;

  return {
    currentStreak: newCurrentStreak,
    longestStreak: Math.max(prev.longestStreak, newCurrentStreak),
    lastActivityDate: todayISODate,
  };
}
