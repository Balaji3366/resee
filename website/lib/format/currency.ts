/**
 * Consolidates the `formatSalary` function duplicated verbatim across
 * components/jobs/JobCard.tsx and app/(dashboard)/jobs/[jobSlug]/page.tsx
 * — those existing call sites are not migrated in this pass. Also adds
 * a generic Intl.NumberFormat-based currency formatter (zero
 * Intl.NumberFormat usage exists anywhere in this codebase today).
 */

/** Generic currency formatter — defaults to INR to match this app's existing India-focused convention (jobs.salary_min/max are documented as LPA). */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "₹4-8 LPA" / "₹6 LPA" — the exact existing salary-range convention used across the Jobs module, generalized into one shared function. */
export function formatSalaryRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `₹${min}-${max} LPA`;
  return `₹${min ?? max} LPA`;
}
