/* ------------------------------------------------------------------ */
/* Wger Mapping Tables - Loaded from JSON                             */
/* ------------------------------------------------------------------ */

import type { ExerciseCategory, ExerciseEquipment } from "../../types/Exercise";
import categoryMapRaw from "../../shared/data/wger-category-map.json";
import equipmentMapRaw from "../../shared/data/wger-equipment-map.json";
import muscleMapRaw from "../../shared/data/wger-muscle-map.json";
import muscleToRegionMapRaw from "../../shared/data/wger-muscle-to-region-map.json";

/**
 * wger category id -> our ExerciseCategory
 * These map wger's exercisecategory.id to our canonical ExerciseCategory enum.
 */
export const CATEGORY_MAP: Record<number, string> = categoryMapRaw;

/**
 * wger equipment name -> our ExerciseEquipment
 * These map wger's equipment.name to our canonical ExerciseEquipment enum.
 */
export const EQUIPMENT_MAP: Record<string, string> = equipmentMapRaw;

/**
 * wger muscle name (or name_en) -> our Muscle
 * These map wger's muscle.name or muscle.name_en to our canonical Muscle enum.
 * Both wger 'name' and 'name_en' fields are checked during lookup.
 */
export const MUSCLE_MAP: Record<string, string> = muscleMapRaw;

/**
 * Our Muscle -> BodyRegion
 * Used to determine body region from primary muscles.
 */
export const MUSCLE_TO_REGION: Record<string, string> = muscleToRegionMapRaw;

/**
 * Looks up muscle in MUSCLE_MAP, checking both the provided name
 * and common variations (case-insensitive).
 */
export function mapMuscle(wgerName: string, wgerNameEn?: string): string | undefined {
  // Try exact match on name_en first (most reliable)
  if (wgerNameEn && MUSCLE_MAP[wgerNameEn]) {
    return MUSCLE_MAP[wgerNameEn];
  }
  // Try exact match on name
  if (MUSCLE_MAP[wgerName]) {
    return MUSCLE_MAP[wgerName];
  }
  // Try case-insensitive match
  const lower = wgerName.toLowerCase();
  for (const [key, value] of Object.entries(MUSCLE_MAP)) {
    if (key.toLowerCase() === lower) return value;
  }
  if (wgerNameEn) {
    const lowerEn = wgerNameEn.toLowerCase();
    for (const [key, value] of Object.entries(MUSCLE_MAP)) {
      if (key.toLowerCase() === lowerEn) return value;
    }
  }
  return undefined;
}

/**
 * Maps a category ID to our ExerciseCategory.
 */
export function mapCategory(categoryId: number): ExerciseCategory | undefined {
  return CATEGORY_MAP[categoryId] as ExerciseCategory | undefined;
}

/**
 * Maps an equipment name to our ExerciseEquipment.
 */
export function mapEquipment(equipmentName: string): ExerciseEquipment {
  return EQUIPMENT_MAP[equipmentName] as ExerciseEquipment ?? "Other";
}

/**
 * Determines body region from array of our canonical muscle names.
 */
export function determineBodyRegion(muscles: string[]): string {
  if (muscles.length === 0) return "Full Body";

  const regionCounts = new Map<string, number>();
  for (const muscle of muscles) {
    const region = MUSCLE_TO_REGION[muscle] ?? "Full Body";
    regionCounts.set(region, (regionCounts.get(region) ?? 0) + 1);
  }

  let bestRegion = "Full Body";
  let bestCount = 0;
  for (const [region, count] of regionCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestRegion = region;
    }
  }
  return bestRegion;
}