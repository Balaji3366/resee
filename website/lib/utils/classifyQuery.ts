const LIVE_SEARCH_KEYWORDS = [
  "today",
  "latest",
  "current",
  "live",
  "recent",
  "yesterday",
  "tomorrow",
  "this week",
  "this month",
  "last match",
  "score",
  "cricket",
  "ipl",
  "football",
  "weather",
  "temperature",
  "news",
  "gold price",
  "silver price",
  "stock",
  "share price",
  "bitcoin",
  "ethereum",
  "government",
  "notification",
  "results",
  "exam date",
  "release date",
  "who won",
  "who is",
  "election",
];

export function needsLiveSearch(question: string): boolean {
  const q = question.toLowerCase();

  return LIVE_SEARCH_KEYWORDS.some((keyword) =>
    q.includes(keyword)
  );
}