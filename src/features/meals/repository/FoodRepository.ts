import type { FoodSearchResult } from '../types';
import { unifiedFoods } from '../data/foodDatabase';
import { MealsRepository } from './MealsRepository';
import { createOnlineFoodProvider, type OnlineFoodProvider } from '../services/OnlineFoodProvider';

export class FoodRepository {
  private static onlineProvider: OnlineFoodProvider | null = null;

  private static getProvider(): OnlineFoodProvider {
    if (!this.onlineProvider) {
      this.onlineProvider = createOnlineFoodProvider();
    }
    return this.onlineProvider;
  }

  /**
   * Search flow:
   * 1. Search local Indian food database
   * 2. Search cached foods from previous API calls
   * 3. Search online API
   * 4. Cache any new results from the API
   */
  static async searchFoods(query: string): Promise<FoodSearchResult[]> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const results: FoodSearchResult[] = [];

    // Step 1: Search local database
    const localResults = this.searchLocal(trimmed);
    results.push(...localResults);

    // If we have good local results, return them immediately
    if (localResults.length >= 5) {
      return results;
    }

    // Step 2: Search cached foods
    try {
      const cachedResults = await this.searchCache(trimmed);
      // Deduplicate by name
      const existingNames = new Set(results.map((r) => r.name.toLowerCase()));
      for (const cached of cachedResults) {
        if (!existingNames.has(cached.name.toLowerCase())) {
          results.push(cached);
          existingNames.add(cached.name.toLowerCase());
        }
      }
    } catch {
      // Cache search failed, continue silently
    }

    // Step 3: Search online API
    if (results.length < 10) {
      try {
        const apiResults = await this.searchOnline(trimmed);
        const existingNames = new Set(results.map((r) => r.name.toLowerCase()));

        for (const apiFood of apiResults) {
          if (!existingNames.has(apiFood.name.toLowerCase())) {
            results.push(apiFood);
            existingNames.add(apiFood.name.toLowerCase());

            // Cache the API result for future offline use
            try {
              await MealsRepository.cacheFood({
                id: apiFood.id,
                name: apiFood.name,
                calories: apiFood.calories,
                protein: apiFood.protein,
                carbs: apiFood.carbs,
                fat: apiFood.fat,
                servingSize: apiFood.servingSize,
                servingUnit: apiFood.servingUnit,
                source: 'api',
                lastUsed: new Date().toISOString(),
              });
            } catch {
              // Cache failure is non-critical
            }
          }
        }
      } catch {
        // Online search failed, continue with local + cached results
      }
    }

    return results;
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

    // Check online
    try {
      const provider = this.getProvider();
      return provider.getFoodById(id);
    } catch {
      return null;
    }
  }
}