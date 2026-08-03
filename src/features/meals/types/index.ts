export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

export interface MealItem {
  id: string;
  mealId: string;
  foodId: string;
  name: string;
  quantity: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Whether the quantity is in raw or cooked weight */
  logMode?: 'raw' | 'cooked';
}

export interface Meal {
  id: string;
  date: string;
  mealType: MealType;
  items: MealItem[];
}

export interface FoodCacheEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  source: 'local' | 'api';
  lastUsed: string;
}

export interface FavoriteFood {
  id: string;
  foodId: string;
  name: string;
  addedAt: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealsLogged: number;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  source: 'local' | 'cached' | 'api' | 'custom';
}

export interface DailyCalorieGoal {
  id: number;
  goal: number;
}

/**
 * Daily nutrition progress entry.
 * One entry per day, recording the totals consumed and the goal.
 */
export interface NutritionProgress {
  id: string; // date string, e.g. "2024-01-15"
  date: string;
  caloriesConsumed: number;
  calorieGoal: number;
  protein: number;
  carbs: number;
  fat: number;
  mealsLogged: number;
  recordedAt: string;
}
