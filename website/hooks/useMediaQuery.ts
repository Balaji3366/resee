import { useEffect, useState } from "react";

/**
 * Wraps window.matchMedia — zero existing usage anywhere in this
 * codebase; all responsive behavior today is Tailwind-class-only. Use
 * this only when a layout DECISION (not just styling) needs to happen
 * in JS, e.g. choosing whether to render a drawer vs. inline panel.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** Matches this codebase's de facto sidebar/nav-collapse breakpoint (`lg:`, 1024px). */
export const BREAKPOINT_QUERIES = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
} as const;
