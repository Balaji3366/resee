/**
 * App-wide identity constants. Centralized so a rename/domain change is
 * a one-file edit instead of a grep-and-replace across the codebase.
 */
export const appConfig = {
  name: "ReSee",
  tagline: "See Your Future",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
