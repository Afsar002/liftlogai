import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Meal, MealItem, NutritionTotals, FoodSearchResult, NutritionProgress } from '../types';
import { MealsRepository } from '../repository/MealsRepository';
import { NutritionService } from '../services/NutritionService';
import { useSettings } from '../../settings/hooks/SettingsProvider';
import { v4 as uuidv4 } from 'uuid';

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<NutritionProgress | null>(null);
  const { settings } = useSettings();
  const expertMode = settings?.expertMode || false;

  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const todayMeals = await MealsRepository.ensureTodayMeals();
      const goal = await NutritionService.getCalorieGoal();
      const todayProgress = await MealsRepository.getProgressForDate(
        MealsRepository.getTodayDate()
      );
      
      setMeals(todayMeals);
      setCalorieGoal(goal);
      setProgress(todayProgress ?? null);
    } catch (err) {
      setError('Failed to load meals');
      console.error('Error loading meals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clean up duplicates, migrate legacy per-100g nutrition values,
  // and load meals on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // One-time idempotent migration for meal items stored with per-100g
        // macros before the toLocalFood() fix. Safe to run every mount.
        await MealsRepository.migrateLegacyMealItemNutrition();
        await MealsRepository.ensureTodayMeals();
        await loadMeals();
      } catch (err) {
        console.error('Error initializing meals:', err);
      }
    };
    
    initialize();
  }, [loadMeals]);

  // Record daily progress without reloading meals
  const recordProgress = useCallback(async () => {
    try {
      const today = MealsRepository.getTodayDate();
      const meals = await MealsRepository.getTodayMeals();
      const goal = await NutritionService.getCalorieGoal();
      const totals = NutritionService.calculateTotals(meals, expertMode);
      
      const progressData: NutritionProgress = {
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
      
      await MealsRepository.saveProgress(progressData);
      setProgress(progressData);
    } catch (err) {
      console.error('Error recording progress:', err);
    }
  }, [expertMode]);

  const totals = useMemo<NutritionTotals>(
    () => NutritionService.calculateTotals(meals, expertMode),
    [meals, expertMode]
  );

  const remaining = useMemo(
    () => NutritionService.calculateRemainingCalories(totals.calories, calorieGoal),
    [totals.calories, calorieGoal]
  );

  const addFoodToMeal = useCallback(
    async (mealId: string, food: FoodSearchResult, quantity?: number) => {
      try {
        setError(null);
        await NutritionService.addFoodToMeal(mealId, food, quantity);
        await loadMeals();
        await recordProgress();
      } catch (err) {
        setError('Failed to add food');
        console.error('Error adding food:', err);
      }
    },
    [loadMeals, recordProgress]
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        setError(null);
        await MealsRepository.updateMealItem(itemId, { quantity });
        setMeals((prev) =>
          prev.map((meal) => ({
            ...meal,
            items: meal.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          }))
        );
        await recordProgress();
      } catch (err) {
        setError('Failed to update quantity');
        console.error('Error updating quantity:', err);
      }
    },
    [recordProgress]
  );

  const removeFoodFromMeal = useCallback(
    (itemId: string) => {
      // Update UI immediately - this is the ONLY thing that affects what you see
      setMeals((prev) => 
        prev.map((meal) => ({
          ...meal,
          items: meal.items.filter((item) => item.id !== itemId),
        }))
      );
      // Save to DB in background - completely separate, won't affect UI
      MealsRepository.removeMealItem(itemId).catch((err) => {
        console.error('Error saving to DB:', err);
      });
    },
    []
  );

  const duplicateFoodItem = useCallback(
    (itemId: string) => {
      // Update UI immediately - this is the ONLY thing that affects what you see
      setMeals((prev) => 
        prev.map((meal) => ({
          ...meal,
          items: meal.items.flatMap((item) =>
            item.id === itemId ? [item, { ...item, id: `${Date.now()}-${Math.random()}` }] : [item]
          ),
        }))
      );
      // Save to DB in background - completely separate, won't affect UI
      MealsRepository.duplicateMealItem(itemId).catch((err) => {
        console.error('Error saving to DB:', err);
      });
    },
    []
  );

  const addCustomMeal = useCallback(
    async (mealType: Meal['mealType']) => {
      try {
        setError(null);
        const newMeal = await MealsRepository.addCustomMeal(mealType);
        setMeals((prev) => [...prev, newMeal]);
      } catch (err) {
        setError('Failed to add meal');
        console.error('Error adding meal:', err);
      }
    },
    []
  );

  const updateCalorieGoal = useCallback(async (goal: number) => {
    try {
      setError(null);
      await MealsRepository.setCalorieGoal(goal);
      setCalorieGoal(goal);
    } catch (err) {
      setError('Failed to update calorie goal');
      console.error('Error updating calorie goal:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadMeals();
  }, [loadMeals]);

  return {
    meals,
    calorieGoal,
    totals,
    remaining,
    isLoading,
    error,
    progress,
    addFoodToMeal,
    updateItemQuantity,
    removeFoodFromMeal,
    duplicateFoodItem,
    addCustomMeal,
    updateCalorieGoal,
    refresh,
  };
}
