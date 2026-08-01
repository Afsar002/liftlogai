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
   * Calculate daily totals from meals.
   * Sums every nutrient (including micronutrients) from each meal's items
   * so that zinc, vitaminB6, vitaminB12 and all others are preserved end-to-end.
   */
  static calculateDailyTotals(meals: EnhancedMeal[]): FoodNutrition {
    return meals.reduce((dayAcc, meal) => {
      // Sum all nutrients from this meal's items
      const mealTotals = meal.items.reduce((mealAcc, item) => {
        const n = item.nutrition;
        return {
          calories: mealAcc.calories + n.calories,
          protein: mealAcc.protein + n.protein,
          carbs: mealAcc.carbs + n.carbs,
          fat: mealAcc.fat + n.fat,
          fiber: mealAcc.fiber + n.fiber,
          sugar: mealAcc.sugar + n.sugar,
          sodium: mealAcc.sodium + n.sodium,
          cholesterol: mealAcc.cholesterol + n.cholesterol,
          potassium: mealAcc.potassium + n.potassium,
          calcium: mealAcc.calcium + n.calcium,
          magnesium: mealAcc.magnesium + n.magnesium,
          iron: mealAcc.iron + n.iron,
          zinc: mealAcc.zinc + n.zinc,
          vitaminA: mealAcc.vitaminA + n.vitaminA,
          vitaminB6: mealAcc.vitaminB6 + n.vitaminB6,
          vitaminB12: mealAcc.vitaminB12 + n.vitaminB12,
          vitaminC: mealAcc.vitaminC + n.vitaminC,
          vitaminD: mealAcc.vitaminD + n.vitaminD,
          vitaminE: mealAcc.vitaminE + n.vitaminE,
          vitaminK: mealAcc.vitaminK + n.vitaminK,
        };
      }, { ...EMPTY_FOOD_NUTRITION });

      return {
        calories: dayAcc.calories + mealTotals.calories,
        protein: dayAcc.protein + mealTotals.protein,
        carbs: dayAcc.carbs + mealTotals.carbs,
        fat: dayAcc.fat + mealTotals.fat,
        fiber: dayAcc.fiber + mealTotals.fiber,
        sugar: dayAcc.sugar + mealTotals.sugar,
        sodium: dayAcc.sodium + mealTotals.sodium,
        cholesterol: dayAcc.cholesterol + mealTotals.cholesterol,
        potassium: dayAcc.potassium + mealTotals.potassium,
        calcium: dayAcc.calcium + mealTotals.calcium,
        magnesium: dayAcc.magnesium + mealTotals.magnesium,
        iron: dayAcc.iron + mealTotals.iron,
        zinc: dayAcc.zinc + mealTotals.zinc,
        vitaminA: dayAcc.vitaminA + mealTotals.vitaminA,
        vitaminB6: dayAcc.vitaminB6 + mealTotals.vitaminB6,
        vitaminB12: dayAcc.vitaminB12 + mealTotals.vitaminB12,
        vitaminC: dayAcc.vitaminC + mealTotals.vitaminC,
        vitaminD: dayAcc.vitaminD + mealTotals.vitaminD,
        vitaminE: dayAcc.vitaminE + mealTotals.vitaminE,
        vitaminK: dayAcc.vitaminK + mealTotals.vitaminK,
      };
    }, { ...EMPTY_FOOD_NUTRITION });
  }

  /**
   * Calculate micronutrient statuses
   */
  static calculateMicronutrients(totals: FoodNutrition): MicronutrientStatus[] {
    const micronutrientMap: Record<string, number> = {
      'Vitamin A': totals.vitaminA,
      'Vitamin B6': totals.vitaminB6,
      'Vitamin B12': totals.vitaminB12,
      'Vitamin C': totals.vitaminC, 'Vitamin D': totals.vitaminD,
      'Vitamin E': totals.vitaminE, 'Vitamin K': totals.vitaminK,
      'Calcium': totals.calcium, 'Iron': totals.iron,
      'Magnesium': totals.magnesium, 'Potassium': totals.potassium,
      'Zinc': totals.zinc, 'Sodium_Micro': totals.sodium,
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