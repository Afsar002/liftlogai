/**
 * FoodDatabaseService — Central lazy-loading food database.
 *
 * Architecture:
 *   Components → FoodDatabaseService → Category Modules (lazy-loaded)
 *
 * This service provides:
 *   - Lazy loading of category modules (no initial bundle impact)
 *   - Unified search across all categories
 *   - Food lookup by ID
 *   - Category-based filtering
 *   - Preparation resolution for foods
 *   - Serving unit helpers
 *
 * Backward compatibility:
 *   - All existing IDs (chicken_breast, raw_rice, etc.) remain unchanged
 *   - Existing meals continue to work without modification
 *   - Foods without preparations default to [Raw] preparation
 */

import type { RawFoodEntry, FoodCategory, FoodPreparation } from '../types/expert';
import type { FoodSearchResult } from '../types';
import { NutritionEngine } from '../services/NutritionEngine';
import type { ScaledNutrition } from '../services/nutritionCalculator';

// ================================================================
// TYPES
// ================================================================

interface CategoryModule {
  foods: RawFoodEntry[];
  category: FoodCategory;
}

type LazyLoader = () => Promise<{ default: RawFoodEntry[] }>;

// ================================================================
// CATEGORY REGISTRY
// ================================================================

const CATEGORY_LOADERS: Record<string, LazyLoader> = {
  protein: () => import('./proteinFoods').then(m => ({ default: m.proteinFoods })),
  carbs: () => import('./carbFoods').then(m => ({ default: m.carbFoods })),
  fruit: () => import('./fruitFoods').then(m => ({ default: m.fruitFoods })),
  vegetables: () => import('./vegetableFoods').then(m => ({ default: m.vegetableFoods })),
  fats: () => import('./fatFoods').then(m => ({ default: m.fatFoods })),
  dairy: () => import('./dairyFoods').then(m => ({ default: m.dairyFoods })),
  legumes: () => import('./legumeFoods').then(m => ({ default: m.legumeFoods })),
  eggs: () => import('./eggFoods').then(m => ({ default: m.eggFoods })),
indian: () => import('./indianFoods').then(m => {
    // indianFoods.ts exports as LocalFood[] (default), not RawFoodEntry[]
    // We convert here to maintain backward compatibility
    const localFoods: { name: string; category: string; calories: number; protein: number; carbs: number; fat: number; servingSize: number; servingUnit: string }[] = (m as any).default;
    const converted: RawFoodEntry[] = localFoods.map((f, i) => ({
      id: `indian_${f.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${i}`,
      name: f.name,
      category: 'carbs' as FoodCategory,
      thumbnail: '🍛',
      nutritionPer100g: {
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        fiber: 0,
      },
      cookedConversionFactor: 1.0,
      servingUnit: f.servingUnit,
      defaultServing: f.servingSize,
    }));
    return { default: converted };
  }),
  restaurant: () => import('./restaurantFoods').then(m => ({ default: m.restaurantFoods })),
  supplements: () => import('./supplementFoods').then(m => ({ default: m.supplementFoods })),
};

// ================================================================
// SERVICE
// ================================================================

class FoodDatabaseServiceClass {
  private loadedCategories: Map<string, RawFoodEntry[]> = new Map();
  private loadingPromises: Map<string, Promise<RawFoodEntry[]>> = new Map();
  private allFoodsCache: RawFoodEntry[] | null = null;

  /**
   * Load a category module (lazy, cached).
   * Subsequent calls return the cached array.
   */
  async loadCategory(category: string): Promise<RawFoodEntry[]> {
    const key = category.toLowerCase();
    if (this.loadedCategories.has(key)) {
      return this.loadedCategories.get(key)!;
    }
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }
    const loader = CATEGORY_LOADERS[key];
    if (!loader) {
      this.loadedCategories.set(key, []);
      return [];
    }
    const promise = loader().then(({ default: foods }) => {
      this.loadedCategories.set(key, foods);
      this.allFoodsCache = null; // invalidate cache
      return foods;
    });
    this.loadingPromises.set(key, promise);
    return promise;
  }

  /**
   * Load all categories (heavy operation — use sparingly).
   */
  async loadAll(): Promise<RawFoodEntry[]> {
    if (this.allFoodsCache) return this.allFoodsCache;
    const categories = Object.keys(CATEGORY_LOADERS);
    const results = await Promise.all(categories.map(cat => this.loadCategory(cat)));
    const all = results.flat();
    this.allFoodsCache = all;
    return all;
  }

  /**
   * Search foods across all categories by name.
   */
  async search(query: string, limit: number = 50): Promise<RawFoodEntry[]> {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const all = await this.loadAll();
    return all
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, limit);
  }

  /**
   * Get a food by its ID.
   * Searches all loaded categories (loads all if none loaded).
   */
  async getFoodById(id: string): Promise<RawFoodEntry | undefined> {
    // Check already loaded categories first
    for (const foods of this.loadedCategories.values()) {
      const found = foods.find(f => f.id === id);
      if (found) return found;
    }
    // Load all and search
    const all = await this.loadAll();
    return all.find(f => f.id === id);
  }

  /**
   * Get all foods in a category.
   */
  async getFoodsByCategory(category: FoodCategory | string): Promise<RawFoodEntry[]> {
    const key = category.toLowerCase();
    const loader = CATEGORY_LOADERS[key];
    if (!loader) return [];
    return this.loadCategory(key);
  }

  /**
   * Get the preparation for a food.
   * If the food has preparations, returns the one matching the given ID or the default.
   * If no preparations, returns a default raw preparation.
   */
  getPreparation(food: RawFoodEntry, preparationId?: string): FoodPreparation {
    if (food.preparations && food.preparations.length > 0) {
      if (preparationId) {
        const found = food.preparations.find(p => p.id === preparationId);
        if (found) return found;
      }
      const defaultPrep = food.preparations.find(p => p.isDefault);
      return defaultPrep || food.preparations[0];
    }
    // Default: raw preparation using the food's nutritionPer100g
    return {
      id: 'raw',
      name: 'Raw',
      nutritionPer100g: food.nutritionPer100g,
      conversionFactor: food.cookedConversionFactor,
      isDefault: true,
    };
  }

  /**
   * Get all available preparations for a food.
   */
  getPreparations(food: RawFoodEntry): FoodPreparation[] {
    if (food.preparations && food.preparations.length > 0) {
      return food.preparations;
    }
    // Default: single raw preparation
    return [{
      id: 'raw',
      name: 'Raw',
      nutritionPer100g: food.nutritionPer100g,
      conversionFactor: food.cookedConversionFactor,
      isDefault: true,
    }];
  }

  /**
   * Calculate nutrition for a given food, weight, and preparation.
   *
   * DELEGATES to NutritionEngine (the single calculation authority).
   * The database service only provides food data; it never performs
   * nutrition math itself. This removes the duplicate scaling logic that
   * previously lived here and ensures every nutrient (including zinc,
   * vitaminB6, vitaminB12) is preserved end-to-end.
   *
   * Uses the preparation's nutritionPer100g if available, otherwise
   * falls back to food.nutritionPer100g.
   */
  calculateNutrition(food: RawFoodEntry, weight: number, preparation?: FoodPreparation): ScaledNutrition {
    const prep = preparation || this.getPreparation(food);
    // Build a food-like object that NutritionEngine understands, using the
    // preparation's nutrition profile. The conversion factor from the
    // preparation is used for raw/cooked weight resolution.
    const foodForEngine = {
      nutritionPer100g: prep.nutritionPer100g,
      cookedConversionFactor: prep.conversionFactor,
    };
    return NutritionEngine.calculateFoodNutrition(foodForEngine, weight, 'raw');
  }

  /**
   * Convert a RawFoodEntry to a FoodSearchResult for the basic meal log.
   */
  toFoodSearchResult(food: RawFoodEntry, preparation?: FoodPreparation): FoodSearchResult {
    const prep = preparation || this.getPreparation(food);
    const n = prep.nutritionPer100g;
    // For search results, use per-100g values
    return {
      id: food.id,
      name: food.name,
      calories: n.calories,
      protein: n.protein,
      carbs: n.carbs,
      fat: n.fat,
      servingSize: food.defaultServing,
      servingUnit: food.servingUnit,
      source: 'local',
    };
  }

  /**
   * Get all unique categories available.
   */
  getAvailableCategories(): string[] {
    return Object.keys(CATEGORY_LOADERS);
  }
}

// Singleton
export const FoodDatabaseService = new FoodDatabaseServiceClass();
