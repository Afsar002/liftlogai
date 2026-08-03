import { createContext, useContext, type ReactNode } from 'react';
import type { Meal, MealType, NutritionTotals, FoodSearchResult, NutritionProgress } from '../types';
import { useMeals } from '../hooks/useMeals';

interface MealContextValue {
  meals: Meal[];
  calorieGoal: number;
  totals: NutritionTotals;
  remaining: number;
  isLoading: boolean;
  error: string | null;
  progress: NutritionProgress | null;
  addFoodToMeal: (mealId: string, food: FoodSearchResult, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFoodFromMeal: (itemId: string) => void;
  duplicateFoodItem: (itemId: string) => void;
  addCustomMeal: (mealType: MealType) => Promise<void>;
  updateCalorieGoal: (goal: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const MealContext = createContext<MealContextValue | null>(null);

export function MealProvider({ children }: { children: ReactNode }) {
  const mealData = useMeals();

  return (
    <MealContext.Provider value={mealData}>
      {children}
    </MealContext.Provider>
  );
}

export function useMealContext(): MealContextValue {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMealContext must be used within a MealProvider');
  }
  return context;
}
