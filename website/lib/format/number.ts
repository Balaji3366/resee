/**
 * Genuinely new — zero Intl.NumberFormat usage exists anywhere in this
 * codebase today (confirmed via grep). Numbers are currently either
 * interpolated raw or handled by react-countup for animated counters.
 */

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

/** "1.2K" / "3.4M" — compact form for stat tiles with potentially large counts. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}
