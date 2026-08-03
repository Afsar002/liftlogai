import type { FoodSearchResult } from '../types';

export interface OnlineFoodProvider {
  search(query: string): Promise<FoodSearchResult[]>;
  getFoodById(id: string): Promise<FoodSearchResult | null>;
}

/**
 * OpenFoodFacts API provider
 * Free, open-source food database
 */
export class OpenFoodFactsProvider implements OnlineFoodProvider {
  private baseUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  async search(query: string): Promise<FoodSearchResult[]> {
    try {
      // Try multiple CORS proxies for reliability
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=25`)}`,
        `https://corsproxy.io/?${encodeURIComponent(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=25`)}`,
      ];

      let lastError: Error | null = null;

      for (const url of proxies) {
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) {
            lastError = new Error(`HTTP ${response.status}`);
            continue;
          }

          const data = await response.json();
          
          const products = data.products || [];
          
          if (products.length > 0) {
            return this.parseResults(products);
          }
        } catch (error) {
          lastError = error as Error;
          continue;
        }
      }

      // If all proxies failed, return empty array
      console.warn('All proxies failed, returning empty results');
      return [];
    } catch (error) {
      console.warn('OpenFoodFacts search failed:', error);
      return [];
    }
  }

  async getFoodById(id: string): Promise<FoodSearchResult | null> {
    try {
      const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(id)}.json`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.product) return null;

      return this.parseProduct(data.product);
    } catch {
      return null;
    }
  }

  private parseResults(products: any[]): FoodSearchResult[] {
    return products
      .map((product) => this.parseProduct(product))
      .filter((food): food is FoodSearchResult => food !== null);
  }

  private parseProduct(product: any): FoodSearchResult | null {
    const name = product.product_name || product.product_name_en || '';
    if (!name) return null;

    const per100g = product.nutriments || {};

    return {
      id: product.code || `off-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      calories: Math.round(per100g['energy-kcal'] || per100g.energy_value || 0),
      protein: Math.round((per100g.proteins || per100g.protein_value || 0) * 10) / 10,
      carbs: Math.round((per100g.carbohydrates || per100g.carbohydrates_value || 0) * 10) / 10,
      fat: Math.round((per100g.fat || per100g.fat_value || 0) * 10) / 10,
      servingSize: 100,
      servingUnit: 'g',
      source: 'api',
    };
  }
}

/**
 * USDA FoodData Central provider
 * Fallback or alternative to OpenFoodFacts
 */
export class USDAFoodDataProvider implements OnlineFoodProvider {
  private baseUrl = 'https://api.nal.usda.gov/fdc/v1';

  constructor(private apiKey: string = 'DEMO_KEY') {}

  async search(query: string): Promise<FoodSearchResult[]> {
    try {
      const url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&pageSize=25&api_key=${this.apiKey}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.warn(`USDA returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      return this.parseResults(data.foods || []);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn('USDA request timed out');
      } else {
        console.warn('USDA search failed:', error);
      }
      return [];
    }
  }

  async getFoodById(id: string): Promise<FoodSearchResult | null> {
    try {
      const url = `${this.baseUrl}/food/${encodeURIComponent(id)}?api_key=${this.apiKey}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return this.parseFood(data);
    } catch {
      return null;
    }
  }

  private parseResults(foods: any[]): FoodSearchResult[] {
    return foods
      .map((food) => this.parseFood(food))
      .filter((food): food is FoodSearchResult => food !== null);
  }

  private parseFood(food: any): FoodSearchResult | null {
    const name = food.description || food.brandName || '';
    if (!name) return null;

    const nutrients = this.extractNutrients(food.foodNutrients || []);

    return {
      id: `usda-${food.fdcId || Date.now()}`,
      name,
      calories: nutrients.calories,
      protein: nutrients.protein,
      carbs: nutrients.carbs,
      fat: nutrients.fat,
      servingSize: 100,
      servingUnit: 'g',
      source: 'api',
    };
  }

  private extractNutrients(nutrients: any[]): { calories: number; protein: number; carbs: number; fat: number } {
    const result = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    for (const nutrient of nutrients) {
      const value = nutrient.value || nutrient.amount || 0;
      switch (nutrient.nutrientId || nutrient.number || '') {
        case 1008: // Energy
        case 2048:
          result.calories = Math.round(value);
          break;
        case 1003: // Protein
        case 2057:
          result.protein = Math.round(value * 10) / 10;
          break;
        case 1005: // Carbs
        case 2055:
          result.carbs = Math.round(value * 10) / 10;
          break;
        case 1004: // Fat
        case 2056:
          result.fat = Math.round(value * 10) / 10;
          break;
      }
    }

    return result;
  }
}

/**
 * Factory to create the appropriate provider
 * Currently configured to use OpenFoodFacts
 */
export function createOnlineFoodProvider(): OnlineFoodProvider {
  return new OpenFoodFactsProvider();
}