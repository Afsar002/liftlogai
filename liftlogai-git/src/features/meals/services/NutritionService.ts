import type { Meal, MealItem, NutritionTotals, FoodSearchResult, NutritionProgress } from '../types';
import { MealsRepository } from '../repository/MealsRepository';
import { calculateRequiredCalories } from '../../../shared/lib/calorieCalculator';
import { SettingsService } from '../../settings/services/SettingsService';

export class NutritionService {
  static calculateTotals(meals: Meal[], expertMode: boolean = false): NutritionTotals {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let mealsLogged = 0;

    for (const meal of meals) {
      if (meal.items.length > 0) {
        mealsLogged++;
      }

      for (const item of meal.items) {
        const multiplier = item.quantity / item.servingSize;
        
        // Expert mode: More precise calculations without intermediate rounding
        if (expertMode) {
          // Use full precision for expert mode
          calories += item.calories * multiplier;
          protein += item.protein * multiplier;
          carbs += item.carbs * multiplier;
          fat += item.fat * multiplier;
        } else {
          // Standard mode: Round each item before adding
          calories += Math.round(item.calories * multiplier);
          protein += Math.round(item.protein * multiplier * 10) / 10;
          carbs += Math.round(item.carbs * multiplier * 10) / 10;
          fat += Math.round(item.fat * multiplier * 10) / 10;
        }
      }
    }

    return {
      calories: Math.round(calories),
      protein: expertMode ? Math.round(protein * 100) / 100 : Math.round(protein * 10) / 10,
      carbs: expertMode ? Math.round(carbs * 100) / 100 : Math.round(carbs * 10) / 10,
      fat: expertMode ? Math.round(fat * 100) / 100 : Math.round(fat * 10) / 10,
      mealsLogged,
    };
  }

  static calculateRemainingCalories(consumed: number, goal: number): number {
    return Math.max(0, goal - consumed);
  }

  static calculateItemCalories(item: MealItem, expertMode: boolean = false): { calories: number; protein: number; carbs: number; fat: number } {
    const multiplier = item.quantity / item.servingSize;
    
    // Expert mode: Use Atwater factors for more accurate macro calculation
    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    if (expertMode) {
      // Calculate macros from calories using Atwater factors
      const totalCalories = item.calories * multiplier;
      
      // If we have macro data, use it with higher precision
      if (item.protein > 0 || item.carbs > 0 || item.fat > 0) {
        return {
          calories: Math.round(totalCalories),
          protein: Math.round(item.protein * multiplier * 100) / 100,
          carbs: Math.round(item.carbs * multiplier * 100) / 100,
          fat: Math.round(item.fat * multiplier * 100) / 100,
        };
      }
      
      // Otherwise estimate from calories using Atwater factors
      // Typical distribution: 30% protein, 40% carbs, 30% fat
      const protein = (totalCalories * 0.30) / 4;
      const carbs = (totalCalories * 0.40) / 4;
      const fat = (totalCalories * 0.30) / 9;
      
      return {
        calories: Math.round(totalCalories),
        protein: Math.round(protein * 100) / 100,
        carbs: Math.round(carbs * 100) / 100,
        fat: Math.round(fat * 100) / 100,
      };
    }
    
    // Standard mode: Use provided macro values with 1 decimal place
    return {
      calories: Math.round(item.calories * multiplier),
      protein: Math.round(item.protein * multiplier * 10) / 10,
      carbs: Math.round(item.carbs * multiplier * 10) / 10,
      fat: Math.round(item.fat * multiplier * 10) / 10,
    };
  }

static createMealItemFromSearchResult(
    food: FoodSearchResult,
    mealId: string,
    quantity?: number
  ): MealItem {
    // FoodSearchResult values are per-serving (the nutrition for one
    // servingSize). Store them directly; calculateItemCalories /
    // calculateTotals scale by quantity / servingSize.
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      mealId,
      foodId: food.id,
      name: food.name,
      quantity: quantity || food.servingSize,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    };
  }

  /**
   * Gets the calorie goal. If the user has profile data set up,
   * calculates the required calories based on their needs.
   * Falls back to the manually-set goal if no profile is available.
   */
  static async getCalorieGoal(): Promise<number> {
    const settings = await SettingsService.getSettings();
    const calculation = calculateRequiredCalories(settings);
    return calculation.requiredCalories;
  }

  /**
   * Gets the full calorie calculation breakdown for display.
   */
  static async getCalorieCalculation(): Promise<ReturnType<typeof calculateRequiredCalories>> {
    const settings = await SettingsService.getSettings();
    return calculateRequiredCalories(settings);
  }

  /**
   * Gets the manually-set calorie goal from the database.
   */
  static async getManualCalorieGoal(): Promise<number> {
    return MealsRepository.getCalorieGoal();
  }

  /**
   * Sets the manually-set calorie goal in the database.
   */
  static async setCalorieGoal(goal: number): Promise<void> {
    await MealsRepository.setCalorieGoal(goal);
  }

  /**
   * Records today's nutrition progress to the database.
   * Called after meals are loaded or updated.
   */
  static async recordDailyProgress(): Promise<NutritionProgress | null> {
    const today = MealsRepository.getTodayDate();
    const meals = await MealsRepository.getTodayMeals();
    const totals = this.calculateTotals(meals);
    const goal = await this.getCalorieGoal();

    const progress: NutritionProgress = {
      id: today,
      date: today,
      caloriesConsumed: totals.calories,
      calorieGoal: goal,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      mealsLogged: totals.mealsLogged,
      recordedAt: new Date().toISOString(),
    };

    await MealsRepository.saveProgress(progress);
    return progress;
  }

  /**
   * Gets today's nutrition data including calculated goal and progress.
   */
  static async getTodayNutrition(): Promise<{
    meals: Meal[];
    totals: NutritionTotals;
    goal: number;
    remaining: number;
    progress: NutritionProgress | null;
  }> {
    const meals = await MealsRepository.ensureTodayMeals();
    const goal = await this.getCalorieGoal();
    const totals = this.calculateTotals(meals);
    const remaining = this.calculateRemainingCalories(totals.calories, goal);
    const progress = await MealsRepository.getProgressForDate(MealsRepository.getTodayDate());

    return { meals, totals, goal, remaining, progress: progress ?? null };
  }

  static async addFoodToMeal(
    mealId: string,
    food: FoodSearchResult,
    quantity?: number
  ): Promise<MealItem> {
    const item = this.createMealItemFromSearchResult(food, mealId, quantity);
    await MealsRepository.addFoodToMeal(mealId, item);
    return item;
  }

  static async updateItemQuantity(
    itemId: string,
    quantity: number
  ): Promise<void> {
    await MealsRepository.updateMealItem(itemId, { quantity });
  }

  /**
   * Gets nutrition progress history for the past N days.
   */
  static async getProgressHistory(limit: number = 30): Promise<NutritionProgress[]> {
    return MealsRepository.getProgressHistory(limit);
  }
}
