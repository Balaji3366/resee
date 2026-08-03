/**
 * Tiered, always-encouraging Job Match labeling (Decision 11) — never a
 * negative label like "Poor Match." The goal is to guide toward
 * applying, never to discourage it.
 */
export function getJobMatchLabel(score: number): {
  label: string;
  variant: "success" | "warning" | "neutral";
} {
  if (score >= 80) return { label: "Excellent Match", variant: "success" };
  if (score >= 60) return { label: "Good Match", variant: "warning" };
  return { label: "Potential Match", variant: "neutral" };
}
