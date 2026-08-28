import type { FoodSearchResult } from "../types";
import { FoodRepository } from "../repository/FoodRepository";
import * as UnifiedFoodService from "./UnifiedFoodService";
import * as WgerNutritionService from "./WgerNutritionService";
import { nutritionSync } from "../../../shared/lib/SyncManager";

/* ------------------------------------------------------------------ */
/* Public API - Food Search (delegates to UnifiedFoodService)         */
/* ------------------------------------------------------------------ */

/**
 * Searches unified food database (local + wger).
 */
export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  return UnifiedFoodService.searchUnifiedFoods(query);
}

/**
 * Gets a food by ID.
 */
export async function getFoodById(id: string): Promise<FoodSearchResult | null> {
  return UnifiedFoodService.getFoodById(id);
}

/* ------------------------------------------------------------------ */
/* Public API - Nutrition Plans                                       */
/* ------------------------------------------------------------------ */

/**
 * Searches public wger nutrition plans.
 */
export async function searchPublicNutritionPlans(query: string = ""): Promise<WgerNutritionService.WgerNutritionPlan[]> {
  const all = await WgerNutritionService.fetchPublicNutritionPlans();

  if (!query.trim()) return all;

  const tokens = query.toLowerCase().trim().split(/\s+/);
  return all.filter((plan) => {
    const haystack = `${plan.name} ${plan.description}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

/**
 * Gets a wger nutrition plan by UUID.
 */
export async function getWgerNutritionPlanById(uuid: string, accessToken?: string): Promise<WgerNutritionService.WgerNutritionPlan | null> {
  return WgerNutritionService.fetchNutritionPlanById(uuid, accessToken);
}

/**
 * Converts a wger nutrition plan to local format.
 */
export async function convertWgerPlanToLocal(
  plan: WgerNutritionService.WgerNutritionPlan
): Promise<WgerNutritionService.LocalMealPlan> {
  // Build ingredient map from our unified food search
  const ingredientMap = new Map<number, FoodSearchResult>();

  // Extract all unique ingredient IDs from the plan
  const ingredientIds = new Set<number>();
  for (const day of plan.days) {
    for (const meal of day.meals) {
      for (const item of meal.items) {
        ingredientIds.add(item.ingredient);
      }
    }
  }

  // Search for each ingredient (in practice, we'd batch this)
  // For now, we'll rely on the wger food search which is already in UnifiedFoodService
  // This is a placeholder - real implementation would need ingredient ID to food mapping
  return WgerNutritionService.convertNutritionPlanToLocal(plan, ingredientMap);
}

/* ------------------------------------------------------------------ */
/* Public API - Nutrition Diary                                       */
/* ------------------------------------------------------------------ */

/**
 * Fetches nutrition diary for a date range (requires sync enabled).
 */
export async function fetchNutritionDiary(
  startDate: string,
  endDate: string
): Promise<WgerNutritionService.WgerNutritionDiary[]> {
  if (!nutritionSync.isEnabled()) return [];
  const accessToken = nutritionSync.getAccessToken()!;
  return WgerNutritionService.fetchNutritionDiary(accessToken, startDate, endDate);
}

/**
 * Gets a single diary entry by date.
 */
export async function getDiaryEntryByDate(date: string): Promise<WgerNutritionService.WgerNutritionDiary | null> {
  if (!nutritionSync.isEnabled()) return null;
  const accessToken = nutritionSync.getAccessToken()!;
  return WgerNutritionService.fetchDiaryEntryByDate(date, accessToken);
}

/**
 * Converts a wger diary entry to local format.
 */
export function convertDiaryEntryToLocal(
  entry: WgerNutritionService.WgerNutritionDiary
): WgerNutritionService.LocalDailyNutrition {
  // Build ingredient map - placeholder
  const ingredientMap = new Map<number, FoodSearchResult>();
  return WgerNutritionService.convertDiaryEntryToLocal(entry, ingredientMap);
}

/* ------------------------------------------------------------------ */
/* Cloud Sync Configuration                                           */
/* ------------------------------------------------------------------ */

/**
 * Checks if nutrition sync is configured.
 */
export function isSyncEnabled(): boolean {
  return nutritionSync.isEnabled();
}

/**
 * Configures wger nutrition sync.
 */
export async function configureSync(accessToken: string): Promise<boolean> {
  return nutritionSync.configure(accessToken, async (token) => {
    try {
      const response = await fetch("https://wger.de/api/v2/user/profile/", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Token ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  });
}

/**
 * Disables nutrition sync.
 */
export function disableSync(): void {
  nutritionSync.disable();
}

/**
 * Sets auto-sync preference.
 */
export function setAutoSync(enabled: boolean): void {
  nutritionSync.setAutoSync(enabled);
}

export function getAutoSync(): boolean {
  return nutritionSync.getAutoSync();
}

/* ------------------------------------------------------------------ */
/* Sync Operations                                                    */
/* ------------------------------------------------------------------ */

export interface NutritionSyncResult {
  pushed: number;
  pulled: number;
  errors: string[];
}

/**
 * Pushes a daily nutrition log to wger.
 */
export async function pushDailyNutrition(
  daily: WgerNutritionService.LocalDailyNutrition
): Promise<string | null> {
  if (!nutritionSync.isEnabled()) return null;
  const accessToken = nutritionSync.getAccessToken()!;

  // Build ingredient reverse map - placeholder
  const ingredientReverseMap = new Map<string, number>();
  return WgerNutritionService.pushDailyNutritionToWger(daily, accessToken, ingredientReverseMap);
}


/* ------------------------------------------------------------------ */
/* Cache Management                                                   */
/* ------------------------------------------------------------------ */

export function invalidateAllNutritionCache(): void {
  UnifiedFoodService.invalidateUnifiedFoodCache();
  WgerNutritionService.invalidateAllNutritionCache();
}

export function hasFreshWgerNutritionPlansCache(): boolean {
  return WgerNutritionService.hasFreshNutritionPlansCache();
}

export function hasFreshWgerNutritionDiaryCache(): boolean {
  return WgerNutritionService.hasFreshNutritionDiaryCache();
}

export function getCachedWgerNutritionPlansCount(): number {
  return WgerNutritionService.getCachedNutritionPlansCount();
}

export function getCachedWgerNutritionDiaryCount(): number {
  return WgerNutritionService.getCachedNutritionDiaryCount();
}

/* ------------------------------------------------------------------ */
/* Re-exports                                                         */
/* ------------------------------------------------------------------ */

export type {
  LocalMealPlan,
  LocalMealPlanDay,
  LocalMealPlanMeal,
  LocalMealPlanItem,
  LocalDailyNutrition,
  WgerNutritionPlan,
  WgerNutritionDiary,
} from "./WgerNutritionService";

export {
  fetchPublicNutritionPlans,
  fetchUserNutritionPlans,
  fetchNutritionPlanById,
  createNutritionPlan,
  upsertDiaryEntry,
  invalidateNutritionPlansCache,
  invalidateNutritionDiaryCache,
  invalidateAllNutritionCache as invalidateWgerAllNutritionCache,
  hasFreshNutritionPlansCache,
  hasFreshNutritionDiaryCache,
  getCachedNutritionPlansCount,
  getCachedNutritionDiaryCount,
} from "./WgerNutritionService";