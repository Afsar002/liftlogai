import type { WeightUnit } from "../../features/settings/types";

/**
 * Kilograms per pound. Stored weights are always kept in kg; this is only
 * used to convert for display when the user prefers lb.
 */
export const KG_PER_LB = 0.45359237;

/**
 * Convert a stored kg value into the display unit.
 * Stored numbers stay in kg; conversion happens at render time only.
 */
export function displayWeight(kgValue: number, unit: WeightUnit): number {
  return unit === "lb" ? kgValue / KG_PER_LB : kgValue;
}

/**
 * Format a weight for display in the active unit, e.g. "100 kg" or "220.5 lb".
 * `en-IN` keeps number grouping consistent with the app date format.
 */
export function formatWeight(kgValue: number, unit: WeightUnit): string {
  return `${displayWeight(kgValue, unit).toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  })} ${unit}`;
}

/**
 * Format a volume (kg·reps) for display exactly like a single weight.
 */
export function formatVolume(kgVolume: number, unit: WeightUnit): string {
  return formatWeight(kgVolume, unit);
}