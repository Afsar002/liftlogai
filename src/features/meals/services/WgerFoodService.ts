import type { FoodSearchResult } from "../types";
import { createIdMap } from "../../../shared/lib/IdMap";

const foodIdMap = createIdMap<number>("food");

/* ------------------------------------------------------------------ */
/* wger API types (minimal subset we need)                            */
/* ------------------------------------------------------------------ */

interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface WgerIngredient {
  id: number;
  uuid: string;
  remote_id: string | null;
  source_name: string;
  source_url: string;
  code: string | null;
  name: string;
  common_name: string;
  brand: string;
  created: string;
  last_update: string;
  last_imported: string;
  energy: number; // kcal per 100g
  protein: string;
  carbohydrates: string;
  carbohydrates_sugar: string | null;
  fat: string;
  fat_saturated: string | null;
  fiber: string | null;
  sodium: string | null;
  is_vegan: boolean | null;
  is_vegetarian: boolean | null;
  weight_units: Array<{ id: number; name: string; amount: number; gram_weight: number }>;
  nutriscore: string | null;
  license: number;
  license_title: string;
  license_object_url: string;
  license_author: string;
  license_author_url: string;
  license_derivative_source_url: string;
  language: number;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const WGER_BASE_URL = "https://wger.de/api/v2";
const DEFAULT_LANGUAGE = 2; // English
const CACHE_KEY = "liftlog_wger_foods";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ------------------------------------------------------------------ */
/* Cache helpers                                                      */
/* ------------------------------------------------------------------ */

interface CachedWgerFoodData {
  timestamp: number;
  foods: FoodSearchResult[];
}

function readCache(): CachedWgerFoodData | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWgerFoodData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(foods: FoodSearchResult[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), foods }));
  } catch {
    // Ignore quota errors
  }
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                       */
/* ------------------------------------------------------------------ */

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });
  if (!response.ok) {
    throw new Error(`wger API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function fetchAllPages<T>(initialUrl: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = initialUrl;
  while (url) {
    const response: WgerPaginatedResponse<T> = await fetchJson<WgerPaginatedResponse<T>>(url);
    results.push(...response.results);
    url = response.next;
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Searches wger ingredient database and returns foods in our FoodSearchResult format.
 * Uses cached data if fresh, otherwise fetches from API.
 */
export async function searchWgerFoods(query: string, forceRefresh = false): Promise<FoodSearchResult[]> {
  const cacheKey = `wger_food_search_${query.toLowerCase().trim()}`;

  // Check cache first (for exact query matches)
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) {
      // Filter cached results for this query
      const filtered = cached.foods.filter((food) =>
        food.name.toLowerCase().includes(query.toLowerCase().trim())
      );
      if (filtered.length > 0) return filtered;
    }
  }

  try {
    // Search wger API - use name= for exact match or name__icontains for partial
    // The 'search' parameter uses full-text search which returns irrelevant results
    // Try exact name match first, then fall back to partial match
    const exactMatchUrl = `${WGER_BASE_URL}/ingredient/?name=${encodeURIComponent(query)}&language=${DEFAULT_LANGUAGE}&page_size=50`;
    let ingredients = await fetchAllPages<WgerIngredient>(exactMatchUrl);

    // If no exact matches, try partial name matching
    if (ingredients.length === 0) {
      const partialMatchUrl = `${WGER_BASE_URL}/ingredient/?name__icontains=${encodeURIComponent(query)}&language=${DEFAULT_LANGUAGE}&page_size=50`;
      ingredients = await fetchAllPages<WgerIngredient>(partialMatchUrl);
    }

    // Transform to our FoodSearchResult format
    const foods = ingredients
      .filter((ing) => ing.name.trim() && ing.energy > 0)
      .map((ing) => transformWgerIngredient(ing))
      .filter((f): f is FoodSearchResult => f !== null);

    // Build ID mapping with numeric wger IDs for cross-device deduplication
    foodIdMap.buildMappingFromItems(
      ingredients.filter(ing => ing.name.trim() && ing.energy > 0),
      ing => ing.uuid,
      ing => ing.id,
      ing => ing.name.trim()
    );

    // Update cache with new results (merge with existing)
    if (!forceRefresh) {
      const cached = readCache();
      const existingFoods = cached?.foods ?? [];
      const existingIds = new Set(existingFoods.map((f) => f.id));
      const newFoods = foods.filter((f) => !existingIds.has(f.id));
      writeCache([...existingFoods, ...newFoods].slice(0, 5000)); // Cap cache at 5000 items
    }

    return foods;
  } catch (error) {
    console.error("[WgerFoodService] Failed to search foods:", error);
    // Return cached data even if stale as fallback
    const cached = readCache();
    if (cached) {
      return cached.foods.filter((food) =>
        food.name.toLowerCase().includes(query.toLowerCase().trim())
      );
    }
    throw error;
  }
}

/**
 * Transforms a single wger Ingredient to our FoodSearchResult format.
 * Returns null if the ingredient cannot be mapped (e.g., missing name or energy).
 */
function transformWgerIngredient(ing: WgerIngredient): FoodSearchResult | null {
  if (!ing.name?.trim() || ing.energy <= 0) return null;

  // Determine serving size from weight units (prefer grams)
  let servingSize = 100;
  let servingUnit = "g";
  if (ing.weight_units.length > 0) {
    const gramUnit = ing.weight_units.find((u) => u.name.toLowerCase() === "g" || u.name.toLowerCase() === "gram");
    if (gramUnit) {
      servingSize = gramUnit.amount * gramUnit.gram_weight;
      servingUnit = gramUnit.name;
    } else {
      // Use first weight unit
      servingSize = ing.weight_units[0].amount * ing.weight_units[0].gram_weight;
      servingUnit = ing.weight_units[0].name;
    }
  }

  // Generate deterministic ID from wger UUID
  const id = `wger-${ing.uuid}`;

  return {
    id,
    name: ing.name.trim(),
    calories: Math.round(ing.energy),
    protein: Math.round(parseFloat(ing.protein) * 10) / 10,
    carbs: Math.round(parseFloat(ing.carbohydrates) * 10) / 10,
    fat: Math.round(parseFloat(ing.fat) * 10) / 10,
    servingSize,
    servingUnit,
    source: "api",
  };
}

/**
 * Invalidates the local wger food cache (forces refetch on next call).
 */
export function invalidateWgerFoodCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Checks if cached wger food data exists and is fresh.
 */
export function hasFreshWgerFoodCache(): boolean {
  const cached = readCache();
  return cached !== null;
}

/**
 * Gets the count of cached wger foods without loading them.
 */
export function getCachedWgerFoodCount(): number {
  const cached = readCache();
  return cached?.foods.length ?? 0;
}

/**
 * Preloads wger foods for common search terms in background.
 */
export function preloadWgerFoods(): void {
  const commonTerms = ["chicken", "rice", "egg", "oats", "salmon", "beef", "potato", "banana", "broccoli", "yogurt"];

  // Fire-and-forget for a few common terms
  commonTerms.slice(0, 3).forEach((term) => {
    searchWgerFoods(term).catch(() => {
      // Swallow errors - preload is best effort
    });
  });
}

/**
 * Reads a specific food by ID from the cache.
 * Used for looking up a single food without searching.
 */
export function readCacheForId(id: string): FoodSearchResult | null {
  try {
    const cached = readCache();
    if (!cached) return null;
    return cached.foods.find((f) => f.id === id) ?? null;
  } catch {
    return null;
  }
}