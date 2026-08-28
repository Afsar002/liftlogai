import type { FoodSearchResult } from "../types";
import { FoodRepository } from "../repository/FoodRepository";
import * as WgerFoodService from "./WgerFoodService";
import { createIdMap } from "../../../shared/lib/IdMap";

const foodIdMap = createIdMap<number>("food");

/* ------------------------------------------------------------------ */
/* Caching                                                             */
/* ------------------------------------------------------------------ */

let unifiedCache: Map<string, FoodSearchResult[]> | null = null;
let loadPromise: Promise<FoodSearchResult[]> | null = null;

/* ------------------------------------------------------------------ */
/* Deduplication helpers                                               */
/* ------------------------------------------------------------------ */

/** Normalizes a food name for comparison (lowercase, trim, remove special chars). */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

/** Checks if two foods are likely the same (by normalized name). */
function foodsAreSimilar(a: FoodSearchResult, b: FoodSearchResult): boolean {
  return normalizeName(a.name) === normalizeName(b.name);
}

/**
 * Merges local and wger foods, preferring local for duplicates.
 * Local foods have richer data (exact serving sizes, categories).
 * wger foods supplement the library with 3M+ additional items.
 */
function mergeFoods(local: FoodSearchResult[], wger: FoodSearchResult[]): FoodSearchResult[] {
  const byNormalizedName = new Map<string, FoodSearchResult>();

  // First, add all local foods (they take priority)
  for (const food of local) {
    byNormalizedName.set(normalizeName(food.name), food);
  }

  // Then add wger foods that don't already exist
  let added = 0;
  for (const food of wger) {
    const key = normalizeName(food.name);
    if (!byNormalizedName.has(key)) {
      byNormalizedName.set(key, food);
      added++;
    }
  }

  if (added > 0) {
    console.log(`[UnifiedFoodService] Added ${added} foods from wger`);
  }

  return Array.from(byNormalizedName.values());
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Searches unified food database (local + wger).
 * Caches results in memory; subsequent calls resolve instantly.
 * Use `forceRefresh` to bypass both memory and localStorage cache.
 */
export async function searchUnifiedFoods(query: string, forceRefresh = false): Promise<FoodSearchResult[]> {
  const cacheKey = query.toLowerCase().trim();

  if (unifiedCache && !forceRefresh && unifiedCache.has(cacheKey)) {
    return unifiedCache.get(cacheKey)!;
  }
  if (loadPromise && !forceRefresh) return loadPromise;

  loadPromise = (async () => {
    // Search both sources in parallel
    const [localResults, wgerResults] = await Promise.allSettled([
      FoodRepository.searchFoods(query),
      WgerFoodService.searchWgerFoods(query, forceRefresh),
    ]);

    const local = localResults.status === "fulfilled" ? localResults.value : [];
    const wger = wgerResults.status === "fulfilled" ? wgerResults.value : [];

    if (wgerResults.status === "rejected") {
      console.warn("[UnifiedFoodService] Failed to load wger foods:", wgerResults.reason);
    }

    const merged = mergeFoods(local, wger);

    // Build ID mapping from wger foods for cross-device deduplication
    if (wger.length > 0) {
      foodIdMap.buildMappingFromItems(wger, f => f.id.startsWith("wger-") ? f.id.slice(5) : null, () => null, f => f.name);
    }

    // Cache in memory
    if (!unifiedCache) unifiedCache = new Map();
    unifiedCache.set(cacheKey, merged);

    return merged;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

/** Invalidates all caches (memory + localStorage for wger). */
export function invalidateUnifiedFoodCache(): void {
  unifiedCache = null;
  loadPromise = null;
  WgerFoodService.invalidateWgerFoodCache();
}

/** Preloads unified foods in background (non-blocking). */
export function preloadUnifiedFoods(): void {
  searchUnifiedFoods("chicken").catch(() => {
    // Swallow - user will hit it on first search
  });
}

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

export async function getFoodById(id: string): Promise<FoodSearchResult | null> {
  return FoodRepository.getFoodById(id);
}

/* ------------------------------------------------------------------ */
/* Re-export wger service functions for convenience                   */
/* ------------------------------------------------------------------ */

export { invalidateWgerFoodCache, hasFreshWgerFoodCache, getCachedWgerFoodCount, preloadWgerFoods, readCacheForId } from "./WgerFoodService";