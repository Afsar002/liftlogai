import { db } from '../../../database/db';
import type { Meal, MealItem, FoodCacheEntry, FavoriteFood, NutritionProgress } from '../types';
import { v4 as uuidv4 } from 'uuid';

type MealWithoutItems = Omit<Meal, 'items'>;

export class MealsRepository {
  // --- Meals ---

  static async getMealsForDate(date: string): Promise<Meal[]> {
    const meals = await db.meals.where('date').equals(date).toArray();

    if (meals.length === 0) return [];

    const mealIds = meals.map((m) => m.id);
    const items = await db.mealItems.where('mealId').anyOf(mealIds).toArray();

    return meals.map((m) => ({
      ...m,
      items: items.filter((i) => i.mealId === m.id),
    }));
  }

  static async getMeal(mealId: string): Promise<Meal | undefined> {
    const meal = await db.meals.get(mealId);
    if (!meal) return undefined;

    const items = await db.mealItems.where('mealId').equals(mealId).toArray();
    return { ...meal, items };
  }

  static async saveMeal(meal: Meal): Promise<string> {
    const id = meal.id || uuidv4();

    const mealData: MealWithoutItems = {
      id,
      date: meal.date,
      mealType: meal.mealType,
    };

    await db.meals.put(mealData as Meal);
    await db.mealItems.where('mealId').equals(id).delete();

    if (meal.items && meal.items.length > 0) {
      const itemsWithMealId = meal.items.map((item) => ({
        ...item,
        id: item.id || uuidv4(),
        mealId: id,
      }));
      await db.mealItems.bulkAdd(itemsWithMealId);
    }

    return id;
  }

  static async addFoodToMeal(mealId: string, item: MealItem): Promise<void> {
    await db.mealItems.add({
      ...item,
      id: item.id || uuidv4(),
      mealId,
    });
  }

  static async updateMealItem(itemId: string, updates: Partial<MealItem>): Promise<void> {
    await db.mealItems.update(itemId, updates);
  }

  static async removeMealItem(itemId: string): Promise<void> {
    await db.mealItems.delete(itemId);
  }

  static async duplicateMealItem(itemId: string): Promise<void> {
    const item = await db.mealItems.get(itemId);
    if (item) {
      const { id, ...rest } = item;
      const newItem = {
        ...rest,
        id: uuidv4(),
        quantity: rest.quantity, // Ensure quantity is explicitly copied
      };
      await db.mealItems.add(newItem);
    }
  }

  static async deleteMeal(mealId: string): Promise<void> {
    await db.mealItems.where('mealId').equals(mealId).delete();
    await db.meals.delete(mealId);
  }

  // --- Food Cache ---

  static async searchFoodCache(query: string): Promise<FoodCacheEntry[]> {
    const lower = query.toLowerCase();
    const all = await db.foodCache.toArray();
    return all.filter((f) => f.name.toLowerCase().includes(lower));
  }

  static async cacheFood(food: FoodCacheEntry): Promise<void> {
    const existing = await db.foodCache.get(food.id);
    if (existing) {
      await db.foodCache.update(food.id, { ...food, lastUsed: new Date().toISOString() });
    } else {
      await db.foodCache.add({ ...food, id: food.id || uuidv4() });
    }
  }

  static async getCachedFood(foodId: string): Promise<FoodCacheEntry | undefined> {
    return db.foodCache.get(foodId);
  }

  static async getAllCachedFoods(): Promise<FoodCacheEntry[]> {
    return db.foodCache.toArray();
  }

  // --- Favorites ---

  static async getFavoriteFoods(): Promise<FavoriteFood[]> {
    return db.favoriteFoods.toArray();
  }

  static async addFavoriteFood(food: FavoriteFood): Promise<void> {
    await db.favoriteFoods.add(food);
  }

  static async removeFavoriteFood(foodId: string): Promise<void> {
    await db.favoriteFoods.delete(foodId);
  }

  static async isFavoriteFood(foodId: string): Promise<boolean> {
    const count = await db.favoriteFoods.where('foodId').equals(foodId).count();
    return count > 0;
  }

  // --- Calorie Goal ---

  static async getCalorieGoal(): Promise<number> {
    const entry = await db.dailyCalorieGoal.get(1);
    return entry?.goal ?? 2000;
  }

  static async setCalorieGoal(goal: number): Promise<void> {
    await db.dailyCalorieGoal.put({ id: 1, goal });
  }

  // --- Today's Meals ---

  static getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  static async getTodayMeals(): Promise<Meal[]> {
    const today = this.getTodayDate();
    return this.getMealsForDate(today);
  }

  static async ensureTodayMeals(): Promise<Meal[]> {
    const today = this.getTodayDate();
    const meals = await this.getMealsForDate(today);

    // Remove duplicates - keep only the first occurrence of each meal type
    const uniqueMeals: Meal[] = [];
    const seenTypes = new Set<Meal['mealType']>();
    
    for (const meal of meals) {
      if (!seenTypes.has(meal.mealType)) {
        seenTypes.add(meal.mealType);
        uniqueMeals.push(meal);
      } else {
        // Delete duplicate meal and its items
        await this.deleteMeal(meal.id);
      }
    }
    
    // If we're missing any meal types, create them
    const mealTypes: Meal['mealType'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    for (const mealType of mealTypes) {
      const exists = uniqueMeals.some(m => m.mealType === mealType);
      if (!exists) {
        const newMeal: Meal = {
          id: uuidv4(),
          date: today,
          mealType,
          items: [],
        };
        await db.meals.add(newMeal);
      }
    }
    
    return this.getMealsForDate(today);
  }

  static async getOrCreateMealForType(mealType: Meal['mealType']): Promise<Meal> {
    const today = this.getTodayDate();
    const todayMeals = await this.getMealsForDate(today);
    
    // Check if meal of this type already exists
    const existingMeal = todayMeals.find(m => m.mealType === mealType);
    if (existingMeal) {
      return existingMeal;
    }
    
    // Create new meal of this type
    const newMeal: Meal = {
      id: uuidv4(),
      date: today,
      mealType,
      items: [],
    };
    await db.meals.add(newMeal);
    return newMeal;
  }

  static async addCustomMeal(mealType: Meal['mealType']): Promise<Meal> {
    // Use getOrCreateMealForType to avoid duplicates
    return this.getOrCreateMealForType(mealType);
  }

  // --- Nutrition Progress ---

  static async saveProgress(progress: NutritionProgress): Promise<void> {
    await db.nutritionProgress.put(progress);
  }

  static async getProgressForDate(date: string): Promise<NutritionProgress | undefined> {
    return db.nutritionProgress.where('date').equals(date).first();
  }

  static async getProgressHistory(limit: number = 30): Promise<NutritionProgress[]> {
    return db.nutritionProgress
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray();
  }

  static async getAllProgress(): Promise<NutritionProgress[]> {
    return db.nutritionProgress.orderBy('date').reverse().toArray();
  }

  static async deleteProgress(date: string): Promise<void> {
    await db.nutritionProgress.where('date').equals(date).delete();
  }
}
