import type { FoodSearchResult } from "../types";

/* ------------------------------------------------------------------ */
/* wger API types (minimal subset we need)                            */
/* ------------------------------------------------------------------ */

interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface WgerNutritionPlan {
  id: number;
  uuid: string;
  name: string;
  description: string;
  created: string;
  last_update: string;
  owner: number;
  is_public: boolean;
  license: number;
  days: WgerNutritionPlanDay[];
}

interface WgerNutritionPlanDay {
  id: number;
  uuid: string;
  order: number;
  plan: number;
  meals: WgerMeal[];
}

interface WgerMeal {
  id: number;
  uuid: string;
  name: string; // "Breakfast", "Lunch", "Dinner", "Snack"
  order: number;
  day: number;
  items: WgerMealItem[];
}

interface WgerMealItem {
  id: number;
  uuid: string;
  order: number;
  meal: number;
  ingredient: number; // ingredient ID
  ingredient_detail: {
    id: number;
    uuid: string;
    name: string;
    energy: number; // kcal per 100g
    protein: string;
    carbohydrates: string;
    fat: string;
    weight_units: Array<{
      id: number;
      name: string;
      amount: number;
      gram_weight: number;
    }>;
  };
  amount: number; // in the unit specified by unit
  unit: number; // weight_units ID
  note: string;
}

export interface WgerNutritionDiary {
  id: number;
  uuid: string;
  date: string; // YYYY-MM-DD
  created: string;
  last_update: string;
  meals: WgerNutritionDiaryMeal[];
}

interface WgerNutritionDiaryMeal {
  id: number;
  uuid: string;
  name: string;
  order: number;
  diary: number;
  items: WgerNutritionDiaryItem[];
}

interface WgerNutritionDiaryItem {
  id: number;
  uuid: string;
  order: number;
  meal: number;
  ingredient: number;
  ingredient_detail: {
    id: number;
    uuid: string;
    name: string;
    energy: number;
    protein: string;
    carbohydrates: string;
    fat: string;
    weight_units: Array<{
      id: number;
      name: string;
      amount: number;
      gram_weight: number;
    }>;
  };
  amount: number;
  unit: number;
  note: string;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const WGER_BASE_URL = "https://wger.de/api/v2";
const DEFAULT_LANGUAGE = 2; // English

// Cache keys
const PLANS_CACHE_KEY = "liftlog_wger_nutrition_plans";
const DIARY_CACHE_KEY = "liftlog_wger_nutrition_diary";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ------------------------------------------------------------------ */
/* Cache helpers                                                      */
/* ------------------------------------------------------------------ */

interface CachedPlansData {
  timestamp: number;
  plans: WgerNutritionPlan[];
}

interface CachedDiaryData {
  timestamp: number;
  entries: WgerNutritionDiary[];
}

function readPlansCache(): CachedPlansData | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(PLANS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPlansData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(PLANS_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePlansCache(plans: WgerNutritionPlan[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(PLANS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), plans }));
  } catch { }
}

function readDiaryCache(): CachedDiaryData | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(DIARY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedDiaryData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(DIARY_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeDiaryCache(entries: WgerNutritionDiary[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(DIARY_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), entries }));
  } catch { }
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                       */
/* ------------------------------------------------------------------ */

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en",
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`wger API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function fetchAllPages<T>(initialUrl: string, options?: RequestInit): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = initialUrl;
  while (url) {
    const response: WgerPaginatedResponse<T> = await fetchJson<WgerPaginatedResponse<T>>(url, options);
    results.push(...response.results);
    url = response.next;
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* Transform helpers                                                  */
/* ------------------------------------------------------------------ */

function getServingSize(ingredient: WgerMealItem["ingredient_detail"]): { size: number; unit: string } {
  if (ingredient.weight_units.length > 0) {
    const gramUnit = ingredient.weight_units.find(
      (u) => u.name.toLowerCase() === "g" || u.name.toLowerCase() === "gram"
    );
    if (gramUnit) {
      return { size: gramUnit.amount * gramUnit.gram_weight, unit: gramUnit.name };
    }
    return {
      size: ingredient.weight_units[0].amount * ingredient.weight_units[0].gram_weight,
      unit: ingredient.weight_units[0].name,
    };
  }
  return { size: 100, unit: "g" };
}

/* ------------------------------------------------------------------ */
/* Public API - Nutrition Plans                                       */
/* ------------------------------------------------------------------ */

/**
 * Fetches all public nutrition plans from wger.
 */
export async function fetchPublicNutritionPlans(forceRefresh = false): Promise<WgerNutritionPlan[]> {
  if (!forceRefresh) {
    const cached = readPlansCache();
    if (cached) return cached.plans;
  }

  try {
    const plans = await fetchAllPages<WgerNutritionPlan>(
      `${WGER_BASE_URL}/nutritionplan/?is_public=true&limit=100`
    );
    writePlansCache(plans);
    return plans;
  } catch (error) {
    console.error("[WgerNutritionService] Failed to fetch public nutrition plans:", error);
    const cached = readPlansCache();
    if (cached) return cached.plans;
    throw error;
  }
}

/**
 * Fetches user's nutrition plans (requires auth).
 */
export async function fetchUserNutritionPlans(
  accessToken: string,
  forceRefresh = false
): Promise<WgerNutritionPlan[]> {
  try {
    const plans = await fetchAllPages<WgerNutritionPlan>(
      `${WGER_BASE_URL}/nutritionplan/`,
      { headers: { "Authorization": `Token ${accessToken}` } }
    );
    return plans;
  } catch (error) {
    console.error("[WgerNutritionService] Failed to fetch user nutrition plans:", error);
    return [];
  }
}

/**
 * Fetches a single nutrition plan by UUID.
 */
export async function fetchNutritionPlanById(
  uuid: string,
  accessToken?: string
): Promise<WgerNutritionPlan | null> {
  try {
    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Token ${accessToken}`;

    const plan: WgerNutritionPlan = await fetchJson(
      `${WGER_BASE_URL}/nutritionplan/${uuid}/`,
      { headers }
    );
    return plan;
  } catch (error) {
    console.error("[WgerNutritionService] Failed to fetch nutrition plan:", error);
    return null;
  }
}

/**
 * Converts a wger nutrition plan to our local meal plan format.
 * Requires ingredient ID mapping from wger ingredient ID -> our FoodSearchResult
 */
export interface LocalMealPlan {
  name: string;
  description: string;
  days: LocalMealPlanDay[];
}

export interface LocalMealPlanDay {
  order: number;
  name: string; // "Day 1", "Monday", etc.
  meals: LocalMealPlanMeal[];
}

export interface LocalMealPlanMeal {
  name: string; // "Breakfast", "Lunch", etc.
  order: number;
  items: LocalMealPlanItem[];
}

export interface LocalMealPlanItem {
  foodId: string; // our FoodSearchResult.id
  foodName: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
}

export function convertNutritionPlanToLocal(
  plan: WgerNutritionPlan,
  ingredientMap: Map<number, FoodSearchResult> // wger ingredient.id -> our FoodSearchResult
): LocalMealPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return {
    name: plan.name,
    description: plan.description,
    days: plan.days
      .sort((a, b) => a.order - b.order)
      .map((day, dayIndex) => ({
        order: day.order,
        name: dayNames[dayIndex] ?? `Day ${day.order}`,
        meals: day.meals
          .sort((a, b) => a.order - b.order)
          .map((meal) => ({
            name: meal.name,
            order: meal.order,
            items: meal.items
              .filter((item) => ingredientMap.has(item.ingredient))
              .map((item) => {
                const food = ingredientMap.get(item.ingredient)!;
                const serving = getServingSize(item.ingredient_detail);
                const multiplier = item.amount * (serving.size / 100); // Convert to per-100g basis

                return {
                  foodId: food.id,
                  foodName: food.name,
                  amount: item.amount,
                  unit: serving.unit,
                  calories: Math.round(food.calories * multiplier),
                  protein: Math.round(food.protein * multiplier * 10) / 10,
                  carbs: Math.round(food.carbs * multiplier * 10) / 10,
                  fat: Math.round(food.fat * multiplier * 10) / 10,
                  note: item.note || undefined,
                };
              }),
          })),
      })),
  };
}

/* ------------------------------------------------------------------ */
/* Public API - Nutrition Diary                                       */
/* ------------------------------------------------------------------ */

/**
 * Fetches nutrition diary entries for a date range (requires auth).
 */
export async function fetchNutritionDiary(
  accessToken: string,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  forceRefresh = false
): Promise<WgerNutritionDiary[]> {
  if (!forceRefresh) {
    const cached = readDiaryCache();
    if (cached) {
      const filtered = cached.entries.filter(
        (e) => e.date >= startDate && e.date <= endDate
      );
      if (filtered.length > 0) return filtered;
    }
  }

  try {
    const entries = await fetchAllPages<WgerNutritionDiary>(
      `${WGER_BASE_URL}/nutritiondiary/?date__gte=${startDate}&date__lte=${endDate}&ordering=-date&limit=100`,
      { headers: { "Authorization": `Token ${accessToken}` } }
    );
    writeDiaryCache(entries);
    return entries;
  } catch (error) {
    console.error("[WgerNutritionService] Failed to fetch nutrition diary:", error);
    const cached = readDiaryCache();
    if (cached) {
      return cached.entries.filter((e) => e.date >= startDate && e.date <= endDate);
    }
    throw error;
  }
}

/**
 * Fetches a single diary entry by date.
 */
export async function fetchDiaryEntryByDate(
  date: string, // YYYY-MM-DD
  accessToken: string
): Promise<WgerNutritionDiary | null> {
  try {
    const entries = await fetchAllPages<WgerNutritionDiary>(
      `${WGER_BASE_URL}/nutritiondiary/?date=${date}`,
      { headers: { "Authorization": `Token ${accessToken}` } }
    );
    return entries[0] ?? null;
  } catch (error) {
    console.error("[WgerNutritionService] Failed to fetch diary entry:", error);
    return null;
  }
}

/**
 * Converts a wger diary entry to our local daily nutrition format.
 */
export interface LocalDailyNutrition {
  date: string; // YYYY-MM-DD
  meals: LocalMealPlanMeal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function convertDiaryEntryToLocal(
  entry: WgerNutritionDiary,
  ingredientMap: Map<number, FoodSearchResult>
): LocalDailyNutrition {
  const meals = entry.meals
    .sort((a, b) => a.order - b.order)
    .map((meal) => ({
      name: meal.name,
      order: meal.order,
      items: meal.items
        .filter((item) => ingredientMap.has(item.ingredient))
        .map((item) => {
          const food = ingredientMap.get(item.ingredient)!;
          const serving = getServingSize(item.ingredient_detail);
          const multiplier = item.amount * (serving.size / 100);

          return {
            foodId: food.id,
            foodName: food.name,
            amount: item.amount,
            unit: serving.unit,
            calories: Math.round(food.calories * multiplier),
            protein: Math.round(food.protein * multiplier * 10) / 10,
            carbs: Math.round(food.carbs * multiplier * 10) / 10,
            fat: Math.round(food.fat * multiplier * 10) / 10,
            note: item.note || undefined,
          };
        }),
    }));

  const totals = meals.flatMap((m) => m.items).reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { date: entry.date, meals, totals };
}

/* ------------------------------------------------------------------ */
/* Public API - Write (requires auth)                                 */
/* ------------------------------------------------------------------ */

interface CreateNutritionPlanPayload {
  name: string;
  description: string;
  is_public: boolean;
  days: CreatePlanDayPayload[];
}

interface CreatePlanDayPayload {
  order: number;
  meals: CreatePlanMealPayload[];
}

interface CreatePlanMealPayload {
  name: string;
  order: number;
  items: CreatePlanItemPayload[];
}

interface CreatePlanItemPayload {
  ingredient: number; // ingredient ID
  amount: number;
  unit: number; // weight_units ID
  order: number;
  note?: string;
}

/**
 * Creates a new nutrition plan on wger.
 */
export async function createNutritionPlan(
  payload: CreateNutritionPlanPayload,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/nutritionplan/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Token ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[WgerNutritionService] Create nutrition plan failed:", error);
      return null;
    }

    const created = await response.json();
    invalidateNutritionPlansCache();
    return created.uuid;
  } catch (error) {
    console.error("[WgerNutritionService] Failed to create nutrition plan:", error);
    return null;
  }
}

interface CreateDiaryEntryPayload {
  date: string; // YYYY-MM-DD
  meals: CreateDiaryMealPayload[];
}

interface CreateDiaryMealPayload {
  name: string;
  order: number;
  items: CreateDiaryItemPayload[];
}

interface CreateDiaryItemPayload {
  ingredient: number;
  amount: number;
  unit: number;
  order: number;
  note?: string;
}

/**
 * Creates/updates a nutrition diary entry on wger.
 */
export async function upsertDiaryEntry(
  payload: CreateDiaryEntryPayload,
  accessToken: string
): Promise<string | null> {
  try {
    // Check if entry exists for this date
    const existing = await fetchAllPages<WgerNutritionDiary>(
      `${WGER_BASE_URL}/nutritiondiary/?date=${payload.date}`,
      { headers: { "Authorization": `Token ${accessToken}` } }
    );

    const url = existing.length > 0
      ? `${WGER_BASE_URL}/nutritiondiary/${existing[0].uuid}/`
      : `${WGER_BASE_URL}/nutritiondiary/`;

    const method = existing.length > 0 ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Token ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[WgerNutritionService] Upsert diary entry failed:", error);
      return null;
    }

    const result = await response.json();
    invalidateNutritionDiaryCache();
    return result.uuid;
  } catch (error) {
    console.error("[WgerNutritionService] Failed to upsert diary entry:", error);
    return null;
  }
}

/**
 * Converts our local daily nutrition to wger diary payload and pushes it.
 */
export async function pushDailyNutritionToWger(
  daily: LocalDailyNutrition,
  accessToken: string,
  ingredientReverseMap: Map<string, number> // our FoodSearchResult.id -> wger ingredient.id
): Promise<string | null> {
  const meals: CreateDiaryMealPayload[] = [];
  let mealIndex = 0;

  for (const meal of daily.meals) {
    // Local diary amounts are stored in grams; resolve each ingredient's gram
    // weight-unit ID so the amount is unambiguous on the remote side. Fall back
    // to the ingredient's first weight unit if no gram unit exists.
    const items: CreateDiaryItemPayload[] = [];
    for (let itemIndex = 0; itemIndex < meal.items.length; itemIndex++) {
      const item = meal.items[itemIndex];
      const wgerIngredientId = ingredientReverseMap.get(item.foodId);
      if (wgerIngredientId == null) continue;

      const unit = await resolveIngredientUnitId(wgerIngredientId, accessToken);
      items.push({
        ingredient: wgerIngredientId,
        amount: item.amount,
        unit: unit ?? 1,
        order: itemIndex + 1,
        note: item.note ?? "",
      });
    }

    if (items.length === 0) continue;

    meals.push({
      name: meal.name,
      order: mealIndex + 1,
      items,
    });
    mealIndex += 1;
  }

  if (meals.length === 0) return null;

  const payload: CreateDiaryEntryPayload = {
    date: daily.date,
    meals,
  };

  return upsertDiaryEntry(payload, accessToken);
}

/**
 * Resolves the gram weight-unit ID for a wger ingredient.
 * Local nutrition amounts are stored in grams, so we prefer the "g"/"gram"
 * weight unit; otherwise we fall back to the ingredient's first weight unit.
 * Returns null if the ingredient detail can't be fetched.
 */
async function resolveIngredientUnitId(
  ingredientId: number,
  accessToken: string
): Promise<number | null> {
  try {
    const url = `${WGER_BASE_URL}/ingredient/${ingredientId}/`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${accessToken}`,
      },
    });
    if (!response.ok) return null;

    const ing = (await response.json()) as {
      weight_units: Array<{ id: number; name: string; amount: number; gram_weight: number }>;
    };
    const units = ing.weight_units ?? [];
    if (units.length === 0) return 1;

    const gramUnit = units.find(
      (u) => u.name.trim().toLowerCase() === "g" || u.name.trim().toLowerCase() === "gram"
    );
    return (gramUnit ?? units[0]).id;
  } catch (error) {
    console.error(`[WgerNutritionService] Failed to resolve ingredient ${ingredientId} unit:`, error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Cache invalidation                                                 */
/* ------------------------------------------------------------------ */

export function invalidateNutritionPlansCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(PLANS_CACHE_KEY);
    }
  } catch { }
}

export function invalidateNutritionDiaryCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(DIARY_CACHE_KEY);
    }
  } catch { }
}

export function invalidateAllNutritionCache(): void {
  invalidateNutritionPlansCache();
  invalidateNutritionDiaryCache();
}

export function hasFreshNutritionPlansCache(): boolean {
  return readPlansCache() !== null;
}

export function hasFreshNutritionDiaryCache(): boolean {
  return readDiaryCache() !== null;
}

export function getCachedNutritionPlansCount(): number {
  return readPlansCache()?.plans.length ?? 0;
}

export function getCachedNutritionDiaryCount(): number {
  return readDiaryCache()?.entries.length ?? 0;
}