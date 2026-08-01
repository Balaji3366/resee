import clsx from "clsx";
import type { ClassValue } from "clsx";

/**
 * className-merge helper — Sprint 2 installed clsx but every component
 * built since has hand-joined template literals instead
 * (`${a} ${b} ${c}`). New components should use this instead; existing
 * ones are not migrated in this pass.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Clamps a number between min and max, inclusive. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Truncates a string to `length` characters, appending an ellipsis if it was cut. */
export function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}
