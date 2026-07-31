import type { NutritionDay, EnhancedMeal, EnhancedMealItem, FoodNutrition, NutritionGoals, MicronutrientStatus, AIInsight, MealQualityScore, NutritionTimelinePoint } from '../types/nutrition';
import { EMPTY_FOOD_NUTRITION, DEFAULT_NUTRITION_GOALS, DEFAULT_MICRONUTRIENT_TARGETS } from '../types/nutrition';
import type { Meal, MealItem, NutritionTotals } from '../types';
import { NutritionService } from './NutritionService';
import { MealsRepository } from '../repository/MealsRepository';

export class NutritionDayService {
  /**
   * Convert a basic Meal[] to an EnhancedMeal[]
   */
  static async mealsToEnhancedMeals(meals: Meal[]): Promise<EnhancedMeal[]> {
    return meals.map(meal => {
      const items: EnhancedMealItem[] = meal.items.map(item => ({
        id: item.id,
        mealId: item.mealId,
        foodId: item.foodId,
        foodName: item.name,
        foodCategory: 'other',
        quantity: item.quantity,
        servingSize: item.servingSize,
        servingUnit: item.servingUnit,
        logMode: 'raw',
        nutrition: {
          ...EMPTY_FOOD_NUTRITION,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        },
      }));

      const totals = items.reduce((acc, item) => ({
        calories: acc.calories + item.nutrition.calories,
        protein: acc.protein + item.nutrition.protein,
        carbs: acc.carbs + item.nutrition.carbs,
        fat: acc.fat + item.nutrition.fat,
        fiber: acc.fiber + (item.nutrition.fiber || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

      return {
        id: meal.id,
        date: meal.date,
        mealType: meal.mealType,
        mealTime: meal.date,
        items,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein * 10) / 10,
        totalCarbs: Math.round(totals.carbs * 10) / 10,
        totalFat: Math.round(totals.fat * 10) / 10,
        totalFiber: Math.round(totals.fiber * 10) / 10,
        qualityScore: 0,
      };
    });
  }

  /**
   * Calculate daily totals from meals
   */
  static calculateDailyTotals(meals: EnhancedMeal[]): FoodNutrition {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
      fiber: acc.fiber + meal.totalFiber,
      sugar: acc.sugar + 0,
      sodium: acc.sodium + 0,
      cholesterol: acc.cholesterol + 0,
      potassium: acc.potassium + 0,
      calcium: acc.calcium + 0,
      magnesium: acc.magnesium + 0,
      iron: acc.iron + 0,
      vitaminA: acc.vitaminA + 0,
      vitaminC: acc.vitaminC + 0,
      vitaminD: acc.vitaminD + 0,
      vitaminE: acc.vitaminE + 0,
      vitaminK: acc.vitaminK + 0,
    }), { ...EMPTY_FOOD_NUTRITION });
  }

  /**
   * Calculate micronutrient statuses
   */
  static calculateMicronutrients(totals: FoodNutrition): MicronutrientStatus[] {
    const micronutrientMap: Record<string, number> = {
      'Vitamin A': 0, 'Vitamin B6': 0, 'Vitamin B12': 0,
      'Vitamin C': totals.vitaminC, 'Vitamin D': totals.vitaminD,
      'Vitamin E': totals.vitaminE, 'Vitamin K': totals.vitaminK,
      'Calcium': totals.calcium, 'Iron': totals.iron,
      'Magnesium': totals.magnesium, 'Potassium': totals.potassium,
      'Zinc': 0, 'Sodium_Micro': totals.sodium,
    };

    return Object.entries(DEFAULT_MICRONUTRIENT_TARGETS).map(([name, config]) => {
      const current = micronutrientMap[name] || 0;
      const percentage = config.target > 0 ? Math.round((current / config.target) * 100) : 0;
      let status: MicronutrientStatus['status'] = 'low';
      if (percentage >= 100) status = 'excellent';
      else if (percentage >= 75) status = 'adequate';
      else if (percentage > 125) status = 'excess';

      return {
        name,
        current,
        target: config.target,
        unit: config.unit,
        percentage,
        status,
      };
    });
  }

  /**
   * Build a NutritionDay from basic meals, water, and goals
   */
  static async buildNutritionDay(
    meals: Meal[],
    water: number = 0,
    weight?: number,
    goals: NutritionGoals = DEFAULT_NUTRITION_GOALS,
  ): Promise<NutritionDay> {
    const enhancedMeals = await this.mealsToEnhancedMeals(meals);
    const totals = this.calculateDailyTotals(enhancedMeals);
    const micronutrients = this.calculateMicronutrients(totals);
    const today = MealsRepository.getTodayDate();

    return {
      id: today,
      date: today,
      meals: enhancedMeals,
      water,
      weight,
      totals,
      goals,
      micronutrients,
      dailyQualityScore: 0,
      insights: [],
      synced: false,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate timeline points from progress history
   */
  static async getTimeline(days: number = 30): Promise<NutritionTimelinePoint[]> {
    const progressHistory = await MealsRepository.getProgressHistory(days);
    return progressHistory.map(p => ({
      date: p.date,
      calories: p.caloriesConsumed,
      protein: p.protein,
      carbs: p.carbs,
      fat: p.fat,
      fiber: 0,
      water: 0,
    }));
  }
}