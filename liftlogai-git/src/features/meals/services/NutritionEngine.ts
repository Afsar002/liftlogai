/**
 * NutritionEngine — the single source of truth for ALL nutrition calculations.
 * 
 * Architecture:
 *   Pages → Hooks → NutritionEngine → Services → Repository → Storage
 * 
 * NutritionEngine delegates to specialized services but provides a unified API.
 * No component should calculate calories or macros directly.
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
import { NutritionService } from './NutritionService';
import { NutritionDayService } from './NutritionDayService';
import { AIInsightService } from './AIInsightService';
import { MealsRepository } from '../repository/MealsRepository';
import { calculateRequiredCalories } from '../../../shared/lib/calorieCalculator';
import { SettingsService } from '../../settings/services/SettingsService';
import type { UserSettings } from '../../settings/types';

export class NutritionEngine {
  // ================================================================
  // FOOD NUTRITION
  // ================================================================

  /**
   * Calculate nutrition for a single food item at a given quantity
   */
  static calculateFoodNutrition(
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

  // ================================================================
  // MEAL NUTRITION
  // ================================================================

  /**
   * Calculate total nutrition for a meal from its items
   */
  static calculateMealNutrition(items: MealItem[]): FoodNutrition {
    return items.reduce((acc, item) => {
      const nutrition = this.calculateFoodNutrition(item, item.quantity, item.servingSize);
      return {
        calories: acc.calories + nutrition.calories,
        protein: acc.protein + nutrition.protein,
        carbs: acc.carbs + nutrition.carbs,
        fat: acc.fat + nutrition.fat,
        fiber: acc.fiber + nutrition.fiber,
        sugar: acc.sugar,
        sodium: acc.sodium,
        cholesterol: acc.cholesterol,
        potassium: acc.potassium,
        calcium: acc.calcium,
        magnesium: acc.magnesium,
        iron: acc.iron,
        vitaminA: acc.vitaminA,
        vitaminC: acc.vitaminC,
        vitaminD: acc.vitaminD,
        vitaminE: acc.vitaminE,
        vitaminK: acc.vitaminK,
      };
    }, { ...EMPTY_FOOD_NUTRITION });
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
    const protein = Math.round(settings.weight * 2.2); // 2.2g per kg
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
      // Katch-McArdle formula
      const leanMass = weightKg * (1 - bodyFatPercent / 100);
      return 370 + (21.6 * leanMass);
    }
    // Cunningham formula (simplified)
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
    const weightLossKg = totalDeficit / 7700; // 7700 kcal ≈ 1 kg fat
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
      // Not enough data, use average calories as maintenance
      const avgCalories = calorieHistory.length > 0
        ? Math.round(calorieHistory.reduce((s, d) => s + d.calories, 0) / calorieHistory.length)
        : 2500;
      return { newMaintenance: avgCalories, recommended: avgCalories, expectedChange: 0 };
    }

    // Calculate weekly weight change rate
    const recent = weightHistory.slice(-7);
    const oldest = recent[0].weight;
    const newest = recent[recent.length - 1].weight;
    const weeklyChange = (newest - oldest) / Math.max(1, recent.length / 7);

    // Calculate average daily calories over the period
    const recentCals = calorieHistory.slice(-7);
    const avgCalories = recentCals.length > 0
      ? Math.round(recentCals.reduce((s, d) => s + d.calories, 0) / recentCals.length)
      : 2500;

    // Adjust maintenance based on actual weight change
    // If losing 0.5kg/week on 2500 kcal, maintenance is ~2885 kcal
    const caloricEquivalent = Math.round(weeklyChange * 7700 / 7);
    const estimatedMaintenance = avgCalories + caloricEquivalent;

    // Calculate recommended intake based on goal
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
    // MET values for different training types
    const metValues: Record<string, number> = {
      push: 5.0, pull: 5.0, legs: 6.0, upper: 4.5, lower: 5.5,
      cardio: 7.0, hiit: 8.0, powerlifting: 4.0, bodybuilding: 5.5,
      full_body: 5.5, rest: 1.2,
    };

    const met = metValues[workoutType] || 5.0;
    const caloriesBurned = Math.round(met * bodyweight * 3.5 / 200 * durationMinutes);

    // Training day multipliers
    const multipliers: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
      legs: { calories: 1.3, protein: 1.0, carbs: 1.4, fat: 0.8 },
      push: { calories: 1.2, protein: 1.0, carbs: 1.2, fat: 0.9 },
      pull: { calories: 1.2, protein: 1.0, carbs: 1.2, fat: 0.9 },
      hiit: { calories: 1.25, protein: 1.0, carbs: 1.3, fat: 0.85 },
      cardio: { calories: 1.15, protein: 1.0, carbs: 1.15, fat: 0.9 },
      rest: { calories: 0.85, protein: 1.0, carbs: 0.7, fat: 1.1 },
    };

    const multiplier = multipliers[workoutType] || multipliers.rest;
    const baseCalories = Math.round(bodyweight * 30); // rough maintenance
    const recommendedCalories = Math.round(baseCalories * multiplier.calories);
    const recommendedProtein = Math.round(bodyweight * 2.2 * multiplier.protein);
    const recommendedCarbs = Math.round((recommendedCalories * 0.45) / 4 * multiplier.carbs);
    const recommendedFat = Math.round((recommendedCalories * 0.25) / 9 * multiplier.fat);
    const recommendedWater = Math.round((35 + (met > 5 ? 10 : 0)) * bodyweight);

    return { caloriesBurned, recommendedCalories, recommendedProtein, recommendedCarbs, recommendedFat, recommendedWater };
  }

  // ================================================================
  // COMPETITION PREP (delegates to existing)
  // ================================================================

  static calculateCompetitionPrep(inputs: CompetitionPrepInputs): CompetitionPrepResults {
    // Katch-McArdle BMR
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
        calories: i < 4 ? contestCalories : Math.round(contestCalories * 0.95), // slight reduction in final weeks
        notes: '',
      })),
    };
  }

  // ================================================================
  // AI INSIGHTS (delegates to AIInsightService)
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