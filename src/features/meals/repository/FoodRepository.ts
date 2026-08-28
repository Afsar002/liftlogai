import type { FoodSearchResult } from '../types';
import { unifiedFoods } from '../data/foodDatabase';
import { MealsRepository } from './MealsRepository';
import { createOnlineFoodProvider, type OnlineFoodProvider } from '../services/OnlineFoodProvider';
import * as UnifiedFoodService from '../services/UnifiedFoodService';

export class FoodRepository {
  private static onlineProvider: OnlineFoodProvider | null = null;

  private static getProvider(): OnlineFoodProvider {
    if (!this.onlineProvider) {
      this.onlineProvider = createOnlineFoodProvider();
    }
    return this.onlineProvider;
  }

  /**
   * Search flow (via UnifiedFoodService):
   * 1. Search local Indian food database + cached foods
   * 2. Search wger API (3M+ foods)
   * 3. Merge and deduplicate (local takes priority)
   */
  static async searchFoods(query: string): Promise<FoodSearchResult[]> {
    return UnifiedFoodService.searchUnifiedFoods(query);
  }

  /**
   * Search the bundled Indian food database
   */
  private static searchLocal(query: string): FoodSearchResult[] {
    const lower = query.toLowerCase();
    return unifiedFoods
      .filter((food) => food.name.toLowerCase().includes(lower))
      .map((food) => ({
        id: `local-${food.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        source: 'local' as const,
      }))
      .slice(0, 20);
  }

  /**
   * Search the locally cached foods from previous API calls
   */
  private static async searchCache(query: string): Promise<FoodSearchResult[]> {
    const cached = await MealsRepository.searchFoodCache(query);
    return cached.map((food) => ({
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      source: 'cached' as const,
    }));
  }

  /**
   * Search the online API provider
   */
  private static async searchOnline(query: string): Promise<FoodSearchResult[]> {
    const provider = this.getProvider();
    return provider.search(query);
  }

  /**
   * Get a single food item by ID
   */
  static async getFoodById(id: string): Promise<FoodSearchResult | null> {
    // Check local first
    if (id.startsWith('local-')) {
      const name = id.replace('local-', '').replace(/-/g, ' ');
      const local = unifiedFoods.find(
        (f) => f.name.toLowerCase() === name
      );
      if (local) {
        return {
          id,
          name: local.name,
          calories: local.calories,
          protein: local.protein,
          carbs: local.carbs,
          fat: local.fat,
          servingSize: local.servingSize,
          servingUnit: local.servingUnit,
          source: 'local',
        };
      }
    }

    // Check cache
    try {
      const cached = await MealsRepository.getCachedFood(id);
      if (cached) {
        return {
          id: cached.id,
          name: cached.name,
          calories: cached.calories,
          protein: cached.protein,
          carbs: cached.carbs,
          fat: cached.fat,
          servingSize: cached.servingSize,
          servingUnit: cached.servingUnit,
          source: 'cached',
        };
      }
    } catch {
      // Fall through
    }

    // Check wger
    if (id.startsWith('wger-')) {
      const wgerFood = UnifiedFoodService.readCacheForId(id);
      if (wgerFood) return wgerFood;
    }

    // Check online (OpenFoodFacts)
    try {
      const provider = this.getProvider();
      return provider.getFoodById(id);
    } catch {
      return null;
    }
  }
}