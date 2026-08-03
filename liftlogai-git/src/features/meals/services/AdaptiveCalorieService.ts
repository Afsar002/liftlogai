import type { UserSettings } from '../../settings/types';
import { calculateRequiredCalories } from '../../../shared/lib/calorieCalculator';

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface CalorieEntry {
  date: string;
  calories: number;
}

export interface AdaptiveCalorieResult {
  newMaintenance: number;
  recommended: number;
  expectedWeeklyChange: number;
  confidence: 'low' | 'medium' | 'high';
  daysOfData: number;
  trend: 'losing' | 'gaining' | 'stable';
}

export class AdaptiveCalorieService {
  /**
   * Calculate adaptive calories using MacroFactor-style algorithm.
   * Uses weight trend and calorie intake to estimate true maintenance.
   */
  static calculateAdaptiveCalories(
    weightHistory: WeightEntry[],
    calorieHistory: CalorieEntry[],
    settings: UserSettings,
    targetWeeklyChange: number = 0.5,
  ): AdaptiveCalorieResult {
    const daysOfData = Math.min(weightHistory.length, calorieHistory.length);

    if (daysOfData < 3) {
      const calc = calculateRequiredCalories(settings);
      return {
        newMaintenance: calc.requiredCalories,
        recommended: calc.requiredCalories,
        expectedWeeklyChange: 0,
        confidence: 'low',
        daysOfData,
        trend: 'stable',
      };
    }

    // Calculate weekly weight change rate
    const recentWeights = weightHistory.slice(-7);
    const oldestWeight = recentWeights[0].weight;
    const newestWeight = recentWeights[recentWeights.length - 1].weight;
    const daysSpan = recentWeights.length;
    const dailyChange = (newestWeight - oldestWeight) / Math.max(1, daysSpan);
    const weeklyChange = dailyChange * 7;

    // Calculate average daily calories over the period
    const recentCals = calorieHistory.slice(-7);
    const avgCalories = recentCals.length > 0
      ? Math.round(recentCals.reduce((s, d) => s + d.calories, 0) / recentCals.length)
      : 2500;

    // Adjust maintenance based on actual weight change
    // If losing 0.5kg/week on 2500 kcal, maintenance is ~2885 kcal
    const caloricEquivalent = Math.round(weeklyChange * 7700 / 7);
    const estimatedMaintenance = avgCalories + caloricEquivalent;

    // Determine trend
    let trend: 'losing' | 'gaining' | 'stable';
    if (weeklyChange < -0.2) trend = 'losing';
    else if (weeklyChange > 0.2) trend = 'gaining';
    else trend = 'stable';

    // Determine confidence
    let confidence: 'low' | 'medium' | 'high';
    if (daysOfData >= 14) confidence = 'high';
    else if (daysOfData >= 7) confidence = 'medium';
    else confidence = 'low';

    // Calculate recommended intake based on goal
    const goal = settings.goal;
    const targetDeficit = goal === 'lose' ? Math.round(targetWeeklyChange * 7700 / 7) : 0;
    const targetSurplus = goal === 'gain' ? Math.round(targetWeeklyChange * 7700 / 7) : 0;
    const recommended = estimatedMaintenance - targetDeficit + targetSurplus;

    return {
      newMaintenance: estimatedMaintenance,
      recommended: Math.max(1200, recommended),
      expectedWeeklyChange: Math.round((estimatedMaintenance - recommended) / 7700 * 7 * 100) / 100,
      confidence,
      daysOfData,
      trend,
    };
  }

  /**
   * Get adaptive calorie recommendation for a specific workout type
   */
  static getWorkoutAdjustedCalories(
    baseCalories: number,
    workoutType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'cardio' | 'hiit' | 'powerlifting' | 'bodybuilding' | 'full_body' | 'rest',
  ): number {
    const multipliers: Record<string, number> = {
      legs: 1.3,
      push: 1.2,
      pull: 1.2,
      hiit: 1.25,
      cardio: 1.15,
      bodybuilding: 1.25,
      full_body: 1.25,
      powerlifting: 1.15,
      upper: 1.15,
      lower: 1.25,
      rest: 0.85,
    };

    const multiplier = multipliers[workoutType] || 1.0;
    return Math.round(baseCalories * multiplier);
  }

  /**
   * Generate weekly calorie plan based on workout schedule
   */
  static generateWeeklyPlan(
    maintenanceCalories: number,
    workoutSchedule: { day: string; type: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'cardio' | 'hiit' | 'powerlifting' | 'bodybuilding' | 'full_body' | 'rest' }[],
  ): { day: string; type: string; calories: number }[] {
    return workoutSchedule.map(({ day, type }) => ({
      day,
      type,
      calories: this.getWorkoutAdjustedCalories(maintenanceCalories, type),
    }));
  }
}