import type { UserSettings, Gender, ActivityLevel, FitnessGoal } from "../../features/settings/types";

/**
 * Activity level multipliers for TDEE calculation.
 * Based on the Harris-Benedict / Mifflin-St Jeor activity factors.
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Goal-based calorie adjustments (as a fraction of TDEE).
 * - maintain: no change
 * - lose: ~20% deficit (~500 kcal for most people)
 * - gain: ~20% surplus (~500 kcal for most people)
 */
export const GOAL_ADJUSTMENTS: Record<FitnessGoal, number> = {
  maintain: 1.0,
  lose: 0.8,
  gain: 1.2,
};

export interface CalorieCalculation {
  bmr: number;
  tdee: number;
  requiredCalories: number;
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  deficitOrSurplus: number;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 *
 * BMR (men)   = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5
 * BMR (women) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 * = BMR × activity level multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Calculates the required daily calories based on user profile and goal.
 *
 * TDEE is adjusted by the goal factor:
 * - maintain: TDEE × 1.0
 * - lose:     TDEE × 0.8  (20% deficit)
 * - gain:     TDEE × 1.2  (20% surplus)
 */
export function calculateRequiredCalories(settings: UserSettings): CalorieCalculation {
  const bmr = calculateBMR(
    settings.weight,
    settings.height,
    settings.age,
    settings.gender
  );

  const tdee = calculateTDEE(bmr, settings.activityLevel);

  const adjustment = GOAL_ADJUSTMENTS[settings.goal];
  const requiredCalories = Math.round(tdee * adjustment);

  const deficitOrSurplus = Math.round(requiredCalories - tdee);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    requiredCalories,
    goal: settings.goal,
    activityLevel: settings.activityLevel,
    deficitOrSurplus,
  };
}

/**
 * Convenience: get just the required calorie number from settings.
 */
export function getRequiredCalories(settings: UserSettings): number {
  return calculateRequiredCalories(settings).requiredCalories;
}

