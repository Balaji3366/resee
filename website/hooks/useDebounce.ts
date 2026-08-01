import { useEffect, useState } from "react";

/**
 * Debounces a fast-changing value. Fills a confirmed gap — no debounce
 * utility exists anywhere in this codebase today, so search-as-you-type
 * inputs (e.g. a future Jobs search box) would otherwise fire one
 * request per keystroke.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
