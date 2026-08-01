/**
 * nutritionCalculator — pure, framework-free nutrition math.
 *
 * This module is the SINGLE SOURCE OF TRUTH for scaling nutrition values.
 * NutritionEngine and every calculation service delegate here so that no
 * raw/cooked conversion logic is ever duplicated elsewhere in the app.
 *
 * It has ZERO runtime imports so it can be unit-tested directly in Node
 * using the built-in test runner and native TypeScript type-stripping.
 */

export type NutritionMode = 'raw' | 'cooked' | 'auto';

export interface ScaledNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  iron: number;
  zinc: number;
  vitaminA: number;
  vitaminB6: number;
  vitaminB12: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
}

export const EMPTY_SCALED: ScaledNutrition = {
  calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
  sugar: 0, sodium: 0, cholesterol: 0, potassium: 0,
  calcium: 0, magnesium: 0, iron: 0, zinc: 0,
  vitaminA: 0, vitaminB6: 0, vitaminB12: 0, vitaminC: 0,
  vitaminD: 0, vitaminE: 0, vitaminK: 0,
};

/** Raw nutrition input (per 100g or per serving) */
export interface RawNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  magnesium?: number;
  iron?: number;
  zinc?: number;
  vitaminA?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
}

// ================================================================
// CORE SCALING
// ================================================================

/**
 * Scale a nutrition record by a given factor.
 * e.g. factor = weightGrams / 100
 */
export function scaleNutrition(n: RawNutrition, factor: number): ScaledNutrition {
  const s = (v?: number) => Math.round((v ?? 0) * factor * 10) / 10;
  return {
    calories: Math.round(n.calories * factor),
    protein: Math.round(n.protein * factor * 10) / 10,
    carbs: Math.round(n.carbs * factor * 10) / 10,
    fat: Math.round(n.fat * factor * 10) / 10,
    fiber: s(n.fiber),
    sugar: s(n.sugar),
    sodium: s(n.sodium),
    cholesterol: s(n.cholesterol),
    potassium: s(n.potassium),
    calcium: s(n.calcium),
    magnesium: s(n.magnesium),
    iron: s(n.iron),
    zinc: s(n.zinc),
    vitaminA: s(n.vitaminA),
    vitaminB6: s(n.vitaminB6),
    vitaminB12: s(n.vitaminB12),
    vitaminC: s(n.vitaminC),
    vitaminD: s(n.vitaminD),
    vitaminE: s(n.vitaminE),
    vitaminK: s(n.vitaminK),
  };
}

/**
 * Determine the effective raw-equivalent weight for a given
 * user-input weight and log mode.
 *
 * RAW  → weight is already raw, return as-is.
 * COOKED → convert cooked weight to raw equivalent using
 *          cookedConversionFactor.
 * AUTO → if cookedNutritionPer100g is provided use weight directly,
 *        otherwise fall back to raw-equivalent conversion.
 */
export function resolveRawWeight(
  weightGrams: number,
  mode: NutritionMode,
  cookedConversionFactor: number,
  hasCookedNutrition: boolean,
): number {
  if (mode === 'raw') return weightGrams;
  if (mode === 'cooked') return weightGrams / cookedConversionFactor;
  // AUTO mode
  if (hasCookedNutrition) return weightGrams;
  return weightGrams / cookedConversionFactor;
}

/**
 * Calculate nutrition for a given weight, log mode, and
 * raw + optional cooked nutrition per 100g.
 *
 * Algorithm:
 *   1. Determine the raw-equivalent weight.
 *   2. If mode is COOKED or AUTO and cookedNutritionPer100g is available,
 *      scale cookedNutritionPer100g by (weight / 100).
 *   3. Otherwise scale rawNutritionPer100g by (rawEquivalentWeight / 100).
 */
export function calculateNutrition(
  rawNutritionPer100g: RawNutrition,
  cookedNutritionPer100g: RawNutrition | undefined,
  cookedConversionFactor: number,
  weightGrams: number,
  mode: NutritionMode = 'raw',
): ScaledNutrition {
  const hasCooked = cookedNutritionPer100g !== undefined;
  const rawEq = resolveRawWeight(weightGrams, mode, cookedConversionFactor, hasCooked);

  // COOKED or AUTO with explicit cooked nutrition → use cooked values directly
  if ((mode === 'cooked' || mode === 'auto') && hasCooked) {
    return scaleNutrition(cookedNutritionPer100g!, weightGrams / 100);
  }

  // Otherwise use raw nutrition scaled by raw-equivalent weight
  return scaleNutrition(rawNutritionPer100g, rawEq / 100);
}

// ================================================================
// ADDITION / REDUCTION HELPERS
// ================================================================

/** Sum an array of scaled nutrition values */
export function sumNutrition(values: ScaledNutrition[]): ScaledNutrition {
  return values.reduce((acc, v) => ({
    calories: acc.calories + v.calories,
    protein: acc.protein + v.protein,
    carbs: acc.carbs + v.carbs,
    fat: acc.fat + v.fat,
    fiber: acc.fiber + v.fiber,
    sugar: acc.sugar + v.sugar,
    sodium: acc.sodium + v.sodium,
    cholesterol: acc.cholesterol + v.cholesterol,
    potassium: acc.potassium + v.potassium,
    calcium: acc.calcium + v.calcium,
    magnesium: acc.magnesium + v.magnesium,
    iron: acc.iron + v.iron,
    zinc: acc.zinc + v.zinc,
    vitaminA: acc.vitaminA + v.vitaminA,
    vitaminB6: acc.vitaminB6 + v.vitaminB6,
    vitaminB12: acc.vitaminB12 + v.vitaminB12,
    vitaminC: acc.vitaminC + v.vitaminC,
    vitaminD: acc.vitaminD + v.vitaminD,
    vitaminE: acc.vitaminE + v.vitaminE,
    vitaminK: acc.vitaminK + v.vitaminK,
  }), { ...EMPTY_SCALED });
}

// ================================================================
// CONVERSION HELPERS
// ================================================================

export function rawToCooked(rawWeight: number, factor: number): number {
  return Math.round(rawWeight * factor * 10) / 10;
}

export function cookedToRaw(cookedWeight: number, factor: number): number {
  return Math.round((cookedWeight / factor) * 10) / 10;
}
