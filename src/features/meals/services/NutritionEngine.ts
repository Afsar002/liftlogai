/**
 * NutritionEngine — the single source of truth for ALL nutrition calculations.
 * 
 * Architecture:
 *   Pages → Hooks → NutritionEngine → Services → Repository → Storage
 * 
 * NutritionEngine delegates to the pure nutritionCalculator for all math,
 * and to specialized services for higher-level features.
 * 
 * No component should calculate calories or macros directly.
 * Every raw/cooked conversion must go through NutritionEngine.
 */

import type { Meal, MealItem, NutritionTotals, FoodSearchResult } from '../types';
import type {
  FoodNutrition,
  NutritionGoals,
  NutritionDay,
  EnhancedMeal,
  EnhancedMealItem,
  MicronutrientStatus,
  MealQualityScore,
  NutritionTimelinePoint,
  CompetitionPrepInputs,
  CompetitionPrepResults,
  GoalTrackingData,
  AIInsight,
} from '../types/nutrition';
import { EMPTY_FOOD_NUTRITION, DEFAULT_NUTRITION_GOALS } from '../types/nutrition';
import type { RawFoodEntry, MealBuilderEntry, LogMode } from '../types/expert';
import { NutritionService } from './NutritionService';
import { NutritionDayService } from './NutritionDayService';
import { AIInsightService } from './AIInsightService';
import { MealsRepository } from '../repository/MealsRepository';
import { calculateRequiredCalories } from '../../../shared/lib/calorieCalculator';
import { SettingsService } from '../../settings/services/SettingsService';
import type { UserSettings } from '../../settings/types';
import {
  calculateNutrition as calcNutrition,
  scaleNutrition,
  sumNutrition,
  rawToCooked,
  cookedToRaw,
  resolveRawWeight,
  type NutritionMode,
  type ScaledNutrition,
  type RawNutrition,
} from './nutritionCalculator';

// ================================================================
// HELPERS — convert between app models
// ================================================================

/** Convert a RawFoodEntry nutrition shape to the RawNutrition shape used by the calculator */
function toRawNutrition(n: RawFoodEntry['nutritionPer100g']): RawNutrition {
  return {
    calories: n.calories,
    protein: n.protein,
    carbs: n.carbs,
    fat: n.fat,
    fiber: n.fiber,
    sugar: n.sugar,
    sodium: n.sodium,
    cholesterol: n.cholesterol,
    potassium: n.potassium,
    calcium: n.calcium,
    magnesium: n.magnesium,
    iron: n.iron,
    zinc: n.zinc,
    vitaminA: n.vitaminA,
    vitaminB6: n.vitaminB6,
    vitaminB12: n.vitaminB12,
    vitaminC: n.vitaminC,
    vitaminD: n.vitaminD,
    vitaminE: n.vitaminE,
    vitaminK: n.vitaminK,
  };
}

/** Convert a FoodNutrition (FoodNutrition) to RawNutrition */
function foodNutritionToRawNutrition(n: FoodNutrition): RawNutrition {
  return {
    calories: n.calories,
    protein: n.protein,
    carbs: n.carbs,
    fat: n.fat,
    fiber: n.fiber,
    sugar: n.sugar,
    sodium: n.sodium,
    cholesterol: n.cholesterol,
    potassium: n.potassium,
    calcium: n.calcium,
    magnesium: n.magnesium,
    iron: n.iron,
    zinc: n.zinc,
    vitaminA: n.vitaminA,
    vitaminB6: n.vitaminB6,
    vitaminB12: n.vitaminB12,
    vitaminC: n.vitaminC,
    vitaminD: n.vitaminD,
    vitaminE: n.vitaminE,
    vitaminK: n.vitaminK,
  };
}

/** Convert ScaledNutrition → FoodNutrition */
function toFoodNutrition(s: ScaledNutrition): FoodNutrition {
  return {
    calories: s.calories,
    protein: s.protein,
    carbs: s.carbs,
    fat: s.fat,
    fiber: s.fiber,
    sugar: s.sugar,
    sodium: s.sodium,
    cholesterol: s.cholesterol,
    potassium: s.potassium,
    calcium: s.calcium,
    magnesium: s.magnesium,
    iron: s.iron,
    zinc: s.zinc,
    vitaminA: s.vitaminA,
    vitaminB6: s.vitaminB6,
    vitaminB12: s.vitaminB12,
    vitaminC: s.vitaminC,
    vitaminD: s.vitaminD,
    vitaminE: s.vitaminE,
    vitaminK: s.vitaminK,
  };
}

export class NutritionEngine {
  // ================================================================
  // FOOD NUTRITION — Primary API
  // ================================================================

  /**
   * Calculate nutrition for a single food item.
   *
   * @param food             - RawFoodEntry with nutritionPer100g + cookedConversionFactor
   * @param weightGrams      - The user-input weight
   * @param mode             - 'raw' | 'cooked' | 'auto'
   * @returns                Scaled nutrition values
   */
  static calculateFoodNutrition(
    food: {
      nutritionPer100g: RawFoodEntry['nutritionPer100g'];
      cookedConversionFactor: number;
      cookedNutritionPer100g?: RawFoodEntry['nutritionPer100g'];
    },
    weightGrams: number,
    mode: NutritionMode = 'raw',
  ): ScaledNutrition {
    const raw = toRawNutrition(food.nutritionPer100g);
    const cooked = food.cookedNutritionPer100g ? toRawNutrition(food.cookedNutritionPer100g) : undefined;
    return calcNutrition(raw, cooked, food.cookedConversionFactor, weightGrams, mode);
  }

  /**
   * Calculate nutrition for a single food item (backward-compatible signature).
   * Used by the basic meal flow where meals store pre-computed nutrition values.
   */
  static calculateFoodNutritionLegacy(
    nutrition: { calories: number; protein: number; carbs: number; fat: number; fiber?: number },
    quantity: number,
    servingSize: number,
  ): FoodNutrition {
    const multiplier = quantity / servingSize;
    return {
      ...EMPTY_FOOD_NUTRITION,
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
      fiber: nutrition.fiber ? Math.round(nutrition.fiber * multiplier * 10) / 10 : 0,
    };
  }

  /**
   * Calculate nutrition for a RawFoodEntry given weight and log mode.
   * This is the primary method for expert / raw food mode.
   */
  static calculateRawFoodNutrition(
    food: RawFoodEntry,
    weightGrams: number,
    mode: LogMode,
  ): ScaledNutrition {
    return this.calculateFoodNutrition(food, weightGrams, mode);
  }

  /**
   * Preview nutrition for display in the UI.
   * Same as calculateRawFoodNutrition but always returns FoodNutrition for backward compat.
   */
  static calculateNutritionPreview(
    food: RawFoodEntry,
    weightGrams: number,
    mode: LogMode,
  ): FoodNutrition {
    return toFoodNutrition(this.calculateRawFoodNutrition(food, weightGrams, mode));
  }

  // ================================================================
  // MEAL NUTRITION
  // ================================================================

  /**
   * Calculate total nutrition for a meal from its items (basic meal flow).
   */
  static calculateMealNutrition(items: MealItem[]): FoodNutrition {
    if (items.length === 0) return { ...EMPTY_FOOD_NUTRITION };
    
    const result = items.reduce((acc, item) => {
      const nutrition = this.calculateFoodNutritionLegacy(
        { calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat, fiber: 0 },
        item.quantity,
        item.servingSize,
      );
      return {
        calories: acc.calories + nutrition.calories,
        protein: acc.protein + nutrition.protein,
        carbs: acc.carbs + nutrition.carbs,
        fat: acc.fat + nutrition.fat,
        fiber: acc.fiber + nutrition.fiber,
        sugar: acc.sugar + (nutrition.sugar || 0),
        sodium: acc.sodium + (nutrition.sodium || 0),
        cholesterol: acc.cholesterol + (nutrition.cholesterol || 0),
        potassium: acc.potassium + (nutrition.potassium || 0),
        calcium: acc.calcium + (nutrition.calcium || 0),
        magnesium: acc.magnesium + (nutrition.magnesium || 0),
        iron: acc.iron + (nutrition.iron || 0),
        zinc: acc.zinc + (nutrition.zinc || 0),
        vitaminA: acc.vitaminA + (nutrition.vitaminA || 0),
        vitaminB6: acc.vitaminB6 + (nutrition.vitaminB6 || 0),
        vitaminB12: acc.vitaminB12 + (nutrition.vitaminB12 || 0),
        vitaminC: acc.vitaminC + (nutrition.vitaminC || 0),
        vitaminD: acc.vitaminD + (nutrition.vitaminD || 0),
        vitaminE: acc.vitaminE + (nutrition.vitaminE || 0),
        vitaminK: acc.vitaminK + (nutrition.vitaminK || 0),
      };
    }, { ...EMPTY_FOOD_NUTRITION });
    
    return result;
  }

  /**
   * Calculate nutrition for Meal Builder entries (expert mode).
   * Each entry has a food, rawWeight, and logMode.
   */
  static calculateMealBuilderNutrition(entries: MealBuilderEntry[]): ScaledNutrition {
    const scaled = entries.map(e =>
      this.calculateFoodNutrition(e.food, e.rawWeight, e.logMode)
    );
    return sumNutrition(scaled);
  }

  /**
   * Calculate nutrition for Recipe Builder ingredients.
   * Same pattern as Meal Builder but for the recipe flow.
   */
  static calculateRecipeNutrition(ingredients: Array<{
    food: { nutritionPer100g: RawFoodEntry['nutritionPer100g']; cookedConversionFactor: number; cookedNutritionPer100g?: RawFoodEntry['nutritionPer100g'] };
    quantity: number;
    logMode: LogMode;
  }>): ScaledNutrition {
    const scaled = ingredients.map(i =>
      this.calculateFoodNutrition(i.food, i.quantity, i.logMode)
    );
    return sumNutrition(scaled);
  }

  // ================================================================
  // CONVERSION HELPERS
  // ================================================================

  static convertRawToCooked(rawWeight: number, factor: number): number {
    return rawToCooked(rawWeight, factor);
  }

  static convertCookedToRaw(cookedWeight: number, factor: number): number {
    return cookedToRaw(cookedWeight, factor);
  }

  static resolveRawWeight(weightGrams: number, mode: NutritionMode, factor: number, hasCooked: boolean): number {
    return resolveRawWeight(weightGrams, mode, factor, hasCooked);
  }

  // ================================================================
  // DAILY NUTRITION (delegates to NutritionDayService)
  // ================================================================

  static async calculateDailyNutrition(
    meals: Meal[],
    water: number = 0,
    weight?: number,
    goals?: NutritionGoals,
  ): Promise<NutritionDay> {
    const actualGoals = goals || await this.getDefaultGoals();
    return NutritionDayService.buildNutritionDay(meals, water, weight, actualGoals);
  }

  static calculateDailyTotals(meals: EnhancedMeal[]): FoodNutrition {
    return NutritionDayService.calculateDailyTotals(meals);
  }

  // ================================================================
  // WEEKLY NUTRITION
  // ================================================================

  static async calculateWeeklyNutrition(): Promise<NutritionTimelinePoint[]> {
    return NutritionDayService.getTimeline(7);
  }

  // ================================================================
  // MACRO TARGETS
  // ================================================================

  static calculateMacroTargets(settings: UserSettings): NutritionGoals {
    const calc = calculateRequiredCalories(settings);
    const protein = Math.round(settings.weight * 2.2);
    const fat = Math.round(calc.requiredCalories * 0.25 / 9);
    const carbs = Math.round((calc.requiredCalories - (protein * 4) - (fat * 9)) / 4);

    return {
      calories: calc.requiredCalories,
      protein,
      carbs: Math.max(carbs, 100),
      fat: Math.max(fat, 40),
      fiber: Math.round(settings.weight * 0.4),
      sugar: 50,
      sodium: 2300,
      cholesterol: 300,
      water: Math.round(settings.weight * 35),
      proteinPerKg: 2.2,
      carbsPerKg: Math.round(carbs / settings.weight * 10) / 10,
      fatPerKg: Math.round(fat / settings.weight * 10) / 10,
    };
  }

  static async getDefaultGoals(): Promise<NutritionGoals> {
    try {
      const settings = await SettingsService.getSettings();
      return this.calculateMacroTargets(settings);
    } catch {
      return DEFAULT_NUTRITION_GOALS;
    }
  }

  // ================================================================
  // MICRONUTRIENTS
  // ================================================================

  static calculateMicronutrients(totals: FoodNutrition): MicronutrientStatus[] {
    return NutritionDayService.calculateMicronutrients(totals);
  }

  // ================================================================
  // MEAL QUALITY
  // ================================================================

  static calculateMealQuality(meal: EnhancedMeal): MealQualityScore {
    const items = meal.items;
    const hasProtein = items.some(i => ['protein', 'seafood'].includes(i.foodCategory));
    const hasVeggies = items.some(i => i.foodCategory === 'vegetables');
    const hasFruit = items.some(i => i.foodCategory === 'fruit');
    const hasHealthyFats = items.some(i => ['fats', 'seafood'].includes(i.foodCategory));
    const hasCarbs = items.some(i => ['carbs', 'grains'].includes(i.foodCategory));
    const hasDiversity = new Set(items.map(i => i.foodCategory)).size >= 3;

    let proteinQuality = hasProtein ? 25 : 0;
    let micronutrientDensity = hasVeggies ? 15 : hasFruit ? 10 : 5;
    let fiberScore = meal.totalFiber >= 5 ? 15 : meal.totalFiber >= 3 ? 10 : 5;
    let healthyFats = hasHealthyFats ? 15 : 5;
    let foodDiversity = hasDiversity ? 15 : 5;
    let processedFoodPenalty = items.filter(i => i.foodCategory === 'processed').length * -5;
    let mealTiming = meal.preWorkout || meal.postWorkout ? 10 : 5;
    let hydration = 5;

    const total = Math.max(0, Math.min(100,
      proteinQuality + micronutrientDensity + fiberScore + healthyFats +
      foodDiversity + processedFoodPenalty + mealTiming + hydration
    ));

    return { total, proteinQuality, micronutrientDensity, fiberScore, healthyFats, foodDiversity, processedFoodPenalty, mealTiming, hydration };
  }

  // ================================================================
  // GOAL PROGRESS
  // ================================================================

  static calculateGoalProgress(
    totals: FoodNutrition,
    goals: NutritionGoals,
  ): { percentage: number; remaining: FoodNutrition } {
    const remaining: FoodNutrition = { ...EMPTY_FOOD_NUTRITION };
    let percentage = 0;

    const numericGoalKeys = (Object.keys(goals) as (keyof NutritionGoals)[]).filter(
      k => k !== 'proteinPerKg' && k !== 'carbsPerKg' && k !== 'fatPerKg'
    );
    for (const key of numericGoalKeys) {
      const goal = goals[key] as number;
      const totalValue = totals[key as keyof FoodNutrition] || 0;
      const current = typeof totalValue === 'number' ? totalValue : 0;
      if (goal > 0) {
        const remainingValue = (remaining[key as keyof FoodNutrition] as number || 0);
        if (typeof remainingValue === 'number') {
          (remaining as any)[key] = Math.max(0, goal - current);
        }
        percentage += (current / goal) * 100;
      }
    }

    return { percentage: Math.round(percentage / numericGoalKeys.length), remaining };
  }

  static calculateRemainingMacros(totals: FoodNutrition, goals: NutritionGoals): FoodNutrition {
    return {
      ...EMPTY_FOOD_NUTRITION,
      calories: Math.max(0, goals.calories - totals.calories),
      protein: Math.max(0, goals.protein - totals.protein),
      carbs: Math.max(0, goals.carbs - totals.carbs),
      fat: Math.max(0, goals.fat - totals.fat),
      fiber: Math.max(0, goals.fiber - totals.fiber),
    };
  }

  static calculateCaloriesRemaining(consumed: number, goal: number): number {
    return Math.max(0, goal - consumed);
  }

  // ================================================================
  // BODYWEIGHT CALORIES
  // ================================================================

  static calculateBodyweightCalories(weightKg: number, bodyFatPercent?: number): number {
    if (bodyFatPercent) {
      const leanMass = weightKg * (1 - bodyFatPercent / 100);
      return 370 + (21.6 * leanMass);
    }
    return 370 + (21.6 * weightKg * 0.85);
  }

  // ================================================================
  // PREDICTED WEIGHT
  // ================================================================

  static calculatePredictedWeight(
    currentWeight: number,
    dailyCalories: number,
    maintenanceCalories: number,
    days: number,
  ): number {
    const dailyDeficit = maintenanceCalories - dailyCalories;
    const totalDeficit = dailyDeficit * days;
    const weightLossKg = totalDeficit / 7700;
    return Math.round((currentWeight - weightLossKg) * 100) / 100;
  }

  // ================================================================
  // ADAPTIVE CALORIES (MacroFactor-style)
  // ================================================================

  static calculateAdaptiveCalories(
    weightHistory: { date: string; weight: number }[],
    calorieHistory: { date: string; calories: number }[],
    goal: 'lose' | 'maintain' | 'gain',
    targetWeeklyChange: number = 0.5,
  ): { newMaintenance: number; recommended: number; expectedChange: number } {
    if (weightHistory.length < 3) {
      const avgCalories = calorieHistory.length > 0
        ? Math.round(calorieHistory.reduce((s, d) => s + d.calories, 0) / calorieHistory.length)
        : 2500;
      return { newMaintenance: avgCalories, recommended: avgCalories, expectedChange: 0 };
    }

    const recent = weightHistory.slice(-7);
    const oldest = recent[0].weight;
    const newest = recent[recent.length - 1].weight;
    const weeklyChange = (newest - oldest) / Math.max(1, recent.length / 7);

    const recentCals = calorieHistory.slice(-7);
    const avgCalories = recentCals.length > 0
      ? Math.round(recentCals.reduce((s, d) => s + d.calories, 0) / recentCals.length)
      : 2500;

    const caloricEquivalent = Math.round(weeklyChange * 7700 / 7);
    const estimatedMaintenance = avgCalories + caloricEquivalent;

    const targetDeficit = goal === 'lose' ? Math.round(targetWeeklyChange * 7700 / 7) : 0;
    const targetSurplus = goal === 'gain' ? Math.round(targetWeeklyChange * 7700 / 7) : 0;
    const recommended = estimatedMaintenance - targetDeficit + targetSurplus;

    return {
      newMaintenance: estimatedMaintenance,
      recommended: Math.max(1200, recommended),
      expectedChange: Math.round((estimatedMaintenance - recommended) / 7700 * 7 * 100) / 100,
    };
  }

  // ================================================================
  // WORKOUT NUTRITION
  // ================================================================

  static calculateWorkoutNutrition(
    workoutType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'cardio' | 'hiit' | 'powerlifting' | 'bodybuilding' | 'full_body' | 'rest',
    bodyweight: number,
    durationMinutes: number,
  ): { caloriesBurned: number; recommendedCalories: number; recommendedProtein: number; recommendedCarbs: number; recommendedFat: number; recommendedWater: number } {
    const metValues: Record<string, number> = {
      push: 5.0, pull: 5.0, legs: 6.0, upper: 4.5, lower: 5.5,
      cardio: 7.0, hiit: 8.0, powerlifting: 4.0, bodybuilding: 5.5,
      full_body: 5.5, rest: 1.2,
    };

    const met = metValues[workoutType] || 5.0;
    const caloriesBurned = Math.round(met * bodyweight * 3.5 / 200 * durationMinutes);

    const multipliers: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
      legs: { calories: 1.3, protein: 1.0, carbs: 1.4, fat: 0.8 },
      push: { calories: 1.2, protein: 1.0, carbs: 1.2, fat: 0.9 },
      pull: { calories: 1.2, protein: 1.0, carbs: 1.2, fat: 0.9 },
      hiit: { calories: 1.25, protein: 1.0, carbs: 1.3, fat: 0.85 },
      cardio: { calories: 1.15, protein: 1.0, carbs: 1.15, fat: 0.9 },
      rest: { calories: 0.85, protein: 1.0, carbs: 0.7, fat: 1.1 },
    };

    const multiplier = multipliers[workoutType] || multipliers.rest;
    const baseCalories = Math.round(bodyweight * 30);
    const recommendedCalories = Math.round(baseCalories * multiplier.calories);
    const recommendedProtein = Math.round(bodyweight * 2.2 * multiplier.protein);
    const recommendedCarbs = Math.round((recommendedCalories * 0.45) / 4 * multiplier.carbs);
    const recommendedFat = Math.round((recommendedCalories * 0.25) / 9 * multiplier.fat);
    const recommendedWater = Math.round((35 + (met > 5 ? 10 : 0)) * bodyweight);

    return { caloriesBurned, recommendedCalories, recommendedProtein, recommendedCarbs, recommendedFat, recommendedWater };
  }

  // ================================================================
  // COMPETITION PREP
  // ================================================================

  static calculateCompetitionPrep(inputs: CompetitionPrepInputs): CompetitionPrepResults {
    const leanMass = inputs.currentWeight * (1 - inputs.bodyFatPercentage / 100);
    const bmr = 370 + (21.6 * leanMass);

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
    };
    const maintenance = Math.round(bmr * (activityMultipliers[inputs.dailyActivity] || 1.55));
    const deficit = Math.round(inputs.targetWeeklyLoss * 1100);
    const contestCalories = Math.max(1200, maintenance - deficit);
    const expectedWeeklyFatLoss = deficit / 1100;
    const projectedStageWeight = inputs.currentWeight - (expectedWeeklyFatLoss * inputs.weeksUntilShow);

    const proteinPerKg = 2.3;
    const carbsPerKg = Math.round((contestCalories * 0.35 / 4) / inputs.currentWeight * 10) / 10;
    const fatPerKg = Math.round((contestCalories * 0.25 / 9) / inputs.currentWeight * 10) / 10;

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + inputs.weeksUntilShow * 7);

    return {
      maintenanceCalories: maintenance,
      contestCalories,
      dailyDeficit: deficit,
      expectedWeeklyFatLoss: Math.round(expectedWeeklyFatLoss * 10) / 10,
      projectedStageWeight: Math.round(projectedStageWeight * 10) / 10,
      proteinRecommendation: Math.round(inputs.currentWeight * proteinPerKg),
      carbRecommendation: Math.round(contestCalories * 0.35 / 4),
      fatRecommendation: Math.round(contestCalories * 0.25 / 9),
      waterRecommendation: Math.round(inputs.currentWeight * 35),
      sodiumRecommendation: 1500,
      fiberRecommendation: Math.round(inputs.currentWeight * 0.4),
      proteinPerKg: Math.round(proteinPerKg * 10) / 10,
      carbsPerKg: Math.round(carbsPerKg * 10) / 10,
      fatPerKg: Math.round(fatPerKg * 10) / 10,
      projectedDate: projectedDate.toLocaleDateString(),
      weeklyBreakdown: Array.from({ length: inputs.weeksUntilShow }, (_, i) => ({
        week: i + 1,
        startWeight: Math.round((inputs.currentWeight - expectedWeeklyFatLoss * i) * 10) / 10,
        endWeight: Math.round((inputs.currentWeight - expectedWeeklyFatLoss * (i + 1)) * 10) / 10,
        calories: i < 4 ? contestCalories : Math.round(contestCalories * 0.95),
        notes: '',
      })),
    };
  }

  // ================================================================
  // AI INSIGHTS
  // ================================================================

  static generateInsights(
    totals: FoodNutrition,
    goals: NutritionGoals,
    options?: { proteinPerKg?: number; bodyweight?: number; trainingToday?: boolean },
  ): AIInsight[] {
    return AIInsightService.generateInsights(totals, goals, options);
  }

  // ================================================================
  // GOAL TRACKING
  // ================================================================

  static calculateGoalTracking(
    currentWeight: number,
    targetWeight: number,
    maintenanceCalories: number,
    currentPhase: 'maintain' | 'cut' | 'bulk',
  ): GoalTrackingData {
    const deficit = 500;
    const surplus = 300;
    const cutCalories = maintenanceCalories - deficit;
    const bulkCalories = maintenanceCalories + surplus;
    const weeklyChange = currentPhase === 'cut' ? deficit / 7700 * 7 : currentPhase === 'bulk' ? surplus / 7700 * 7 : 0;
    const weightDiff = currentPhase === 'cut' ? currentWeight - targetWeight : targetWeight - currentWeight;
    const weeksToGoal = weeklyChange > 0 ? weightDiff / (weeklyChange / 7) : 0;
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + Math.round(weeksToGoal * 7));
    const progress = weightDiff > 0 ? Math.min(100, Math.round((1 - (currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100)) : 0;

    return {
      maintenanceCalories,
      cutCalories,
      bulkCalories,
      currentPhase,
      deficit,
      surplus,
      expectedWeeklyChange: Math.round(weeklyChange * 10) / 10,
      projectedGoalDate: projectedDate.toLocaleDateString(),
      progress,
      daysRemaining: Math.round(weeksToGoal * 7),
    };
  }
}
