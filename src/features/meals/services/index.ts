/* ------------------------------------------------------------------ */
/* Meals Services - Unified Exports                                   */
/* ------------------------------------------------------------------ */

// Food services (main public API)
export * from "./WgerFoodService";

// UnifiedFoodService - explicitly re-export to avoid conflicts with WgerNutritionService
export {
  searchUnifiedFoods,
  invalidateUnifiedFoodCache,
  preloadUnifiedFoods,
  getFoodById,
} from "./UnifiedFoodService";

export * from "../../../shared/lib/IdMap";

// Online food providers
export * from "./OnlineFoodProvider";

// Nutrition services (wger-based)
export * from "./WgerNutritionService";

// UnifiedNutritionService - explicitly re-export to avoid conflicts with WgerNutritionService
export {
  searchFoods,
  getFoodById as getUnifiedFoodById,
  searchPublicNutritionPlans,
  getWgerNutritionPlanById,
  convertWgerPlanToLocal,
  fetchNutritionDiary,
  getDiaryEntryByDate,
  convertDiaryEntryToLocal,
  isSyncEnabled,
  configureSync,
  disableSync,
  setAutoSync,
  getAutoSync,
  invalidateAllNutritionCache,
  hasFreshWgerNutritionPlansCache,
  hasFreshWgerNutritionDiaryCache,
  getCachedWgerNutritionPlansCount,
  getCachedWgerNutritionDiaryCount,
  type NutritionSyncResult,
} from "./UnifiedNutritionService";

// Core services
export * from "./NutritionService";
export * from "./MealTemplateService";
export * from "./NutritionDayService";
export * from "./RecipeBuilder";
export * from "./NutritionEngine";
export * from "./nutritionCalculator";
export * from "./AdaptiveCalorieService";
export * from "./BodyCompositionService";
export * from "./AICoachService";
export * from "./AIInsightService";

/* Re-export types */
export type { FoodSearchResult } from "../types";