/**
 * Advanced nutrition data models for the LiftLog AI nutrition system.
 * These extend the basic models in index.ts with full micronutrient support,
 * meal quality scoring, and daily nutrition tracking.
 */

import type { MealType } from './index';

// ============================================================
// ENHANCED FOOD MODEL
// ============================================================

export interface FoodNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  iron: number;
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
}

export type FoodCategory = 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruit' | 'supplements' | 'dairy' | 'grains' | 'legumes' | 'seafood' | 'processed' | 'beverages' | 'other';

export type FoodSource = 'local' | 'cached' | 'api' | 'custom' | 'barcode' | 'raw';

export type LogMode = 'raw' | 'cooked';

export interface CookedConversion {
  rawToCookedFactor: number;
  method: 'bake' | 'boil' | 'grill' | 'fry' | 'steam' | 'raw' | 'other';
  notes?: string;
}

export interface EnhancedFood {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: FoodCategory;
  servingSize: number;
  servingUnit: string;
  /** Nutrition per 100g (or per servingUnit) */
  nutritionPer100g: FoodNutrition;
  /** Cooked weight conversion (raw → cooked factor) */
  cookedConversion?: CookedConversion;
  /** Whether this food is verified/trusted */
  verified: boolean;
  /** Source of the food data */
  source: FoodSource;
  /** Timestamp of last use */
  lastUsed?: string;
  /** Whether this is a favorite */
  favorite?: boolean;
  /** Tags for search/filtering */
  tags?: string[];
}

// ============================================================
// ENHANCED MEAL ITEM MODEL
// ============================================================

export interface EnhancedMealItem {
  id: string;
  mealId: string;
  foodId: string;
  foodName: string;
  foodCategory: FoodCategory;
  /** The weight/amount logged by the user */
  quantity: number;
  servingSize: number;
  servingUnit: string;
  /** Log mode (raw vs cooked) */
  logMode: LogMode;
  /** If cooked, the raw equivalent weight */
  rawWeight?: number;
  /** If raw, the cooked equivalent weight */
  cookedWeight?: number;
  /** Calculated nutrition for this quantity */
  nutrition: FoodNutrition;
  /** Whether this item was consumed pre-workout */
  preWorkout?: boolean;
  /** Whether this item was consumed post-workout */
  postWorkout?: boolean;
  /** User notes for this item */
  notes?: string;
}

// ============================================================
// ENHANCED MEAL MODEL
// ============================================================

export interface EnhancedMeal {
  id: string;
  date: string;
  mealType: MealType;
  mealTime: string;
  items: EnhancedMealItem[];
  notes?: string;
  /** Pre-calculated totals for performance */
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  /** Meal quality score (0-100) */
  qualityScore: number;
  /** Whether this meal was pre-workout */
  preWorkout?: boolean;
  /** Whether this meal was post-workout */
  postWorkout?: boolean;
}

// ============================================================
// NUTRITION DAY MODEL
// ============================================================

export interface NutritionDay {
  id: string; // date string "YYYY-MM-DD"
  date: string;
  meals: EnhancedMeal[];
  /** Water intake in ml */
  water: number;
  /** Body weight in kg (optional) */
  weight?: number;
  /** Daily nutrition totals */
  totals: FoodNutrition;
  /** Daily goals */
  goals: NutritionGoals;
  /** Micronutrient tracking */
  micronutrients: MicronutrientStatus[];
  /** Meal quality score for the day */
  dailyQualityScore: number;
  /** AI-generated insights for the day */
  insights: AIInsight[];
  /** Whether this day's data has been synced */
  synced: boolean;
  /** Last updated timestamp */
  updatedAt: string;
}

// ============================================================
// NUTRITION GOALS
// ============================================================

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  water: number;
  /** Per kg bodyweight targets */
  proteinPerKg?: number;
  carbsPerKg?: number;
  fatPerKg?: number;
}

// ============================================================
// MICRONUTRIENT TRACKING
// ============================================================

export interface MicronutrientStatus {
  name: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
  status: 'low' | 'adequate' | 'excellent' | 'excess';
}

// ============================================================
// MEAL QUALITY SCORE
// ============================================================

export interface MealQualityScore {
  total: number; // 0-100
  proteinQuality: number; // 0-25
  micronutrientDensity: number; // 0-20
  fiberScore: number; // 0-15
  healthyFats: number; // 0-15
  foodDiversity: number; // 0-15
  processedFoodPenalty: number; // 0 to -20
  mealTiming: number; // 0-10
  hydration: number; // 0-5
}

// ============================================================
// AI INSIGHTS
// ============================================================

export interface AIInsight {
  type: 'warning' | 'success' | 'info' | 'tip' | 'critical';
  category: 'protein' | 'carbs' | 'fat' | 'fiber' | 'micronutrient' | 'hydration' | 'timing' | 'quality' | 'calories' | 'sodium';
  message: string;
  icon: string;
  priority: number; // 1-10, higher = more important
  actionable?: boolean;
  suggestion?: string;
}

// ============================================================
// NUTRITION TIMELINE
// ============================================================

export interface NutritionTimelinePoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  weight?: number;
  qualityScore?: number;
}

// ============================================================
// COMPETITION PREP
// ============================================================

export interface CompetitionPrepInputs {
  currentWeight: number;
  targetWeight: number;
  bodyFatPercentage: number;
  weeksUntilShow: number;
  targetWeeklyLoss: number;
  dailyActivity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  trainingDays: number;
  cardioSessions: number;
  /** Whether to use Katch-McArdle (requires BF%) or Mifflin-St Jeor */
  useKatchMcArdle: boolean;
}

export interface CompetitionPrepResults {
  maintenanceCalories: number;
  contestCalories: number;
  dailyDeficit: number;
  expectedWeeklyFatLoss: number;
  projectedStageWeight: number;
  proteinRecommendation: number;
  carbRecommendation: number;
  fatRecommendation: number;
  waterRecommendation: number;
  sodiumRecommendation: number;
  fiberRecommendation: number;
  /** Per kg bodyweight targets */
  proteinPerKg: number;
  carbsPerKg: number;
  fatPerKg: number;
  /** Timeline */
  projectedDate: string;
  weeklyBreakdown: WeeklyPrepBreakdown[];
}

export interface WeeklyPrepBreakdown {
  week: number;
  startWeight: number;
  endWeight: number;
  calories: number;
  notes: string;
}

// ============================================================
// GOAL TRACKING
// ============================================================

export interface GoalTrackingData {
  maintenanceCalories: number;
  cutCalories: number;
  bulkCalories: number;
  currentPhase: 'maintain' | 'cut' | 'bulk';
  deficit: number;
  surplus: number;
  expectedWeeklyChange: number;
  projectedGoalDate: string;
  /** Progress towards goal */
  progress: number; // 0-100
  /** Days remaining */
  daysRemaining: number;
}

// ============================================================
// PEAK WEEK PLANNER
// ============================================================

export interface PeakWeekDay {
  day: number;
  date: string;
  water: number;
  sodium: number;
  carbs: number;
  weight: number;
  energy: 'low' | 'moderate' | 'high';
  notes: string;
}

// ============================================================
// WATER TRACKING
// ============================================================

export interface WaterEntry {
  id: string;
  date: string;
  amount: number; // ml
  timestamp: string;
  source?: 'glass' | 'bottle' | 'other';
}

// ============================================================
// DEFAULT VALUES
// ============================================================

export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  calories: 2500,
  protein: 180,
  carbs: 300,
  fat: 60,
  fiber: 30,
  sugar: 50,
  sodium: 2300,
  cholesterol: 300,
  water: 3000,
};

export const EMPTY_FOOD_NUTRITION: FoodNutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0,
  potassium: 0,
  calcium: 0,
  magnesium: 0,
  iron: 0,
  vitaminA: 0,
  vitaminC: 0,
  vitaminD: 0,
  vitaminE: 0,
  vitaminK: 0,
};

export const DEFAULT_MICRONUTRIENT_TARGETS: Record<string, { target: number; unit: string }> = {
  'Vitamin A': { target: 900, unit: 'mcg' },
  'Vitamin B6': { target: 1.3, unit: 'mg' },
  'Vitamin B12': { target: 2.4, unit: 'mcg' },
  'Vitamin C': { target: 90, unit: 'mg' },
  'Vitamin D': { target: 15, unit: 'mcg' },
  'Vitamin E': { target: 15, unit: 'mg' },
  'Vitamin K': { target: 120, unit: 'mcg' },
  'Calcium': { target: 1000, unit: 'mg' },
  'Iron': { target: 8, unit: 'mg' },
  'Magnesium': { target: 420, unit: 'mg' },
  'Potassium': { target: 4700, unit: 'mg' },
  'Zinc': { target: 11, unit: 'mg' },
  'Sodium_Micro': { target: 2300, unit: 'mg' },
};

export const RAW_TO_COOKED_FACTORS: Record<string, number> = {
  'chicken_breast': 0.75,
  'chicken_thigh': 0.78,
  'turkey': 0.75,
  'lean_beef': 0.70,
  'fish': 0.85,
  'raw_rice': 3.0,
  'raw_oats': 1.5,
  'sweet_potato': 0.85,
  'potato': 0.85,
  'pasta_dry': 2.5,
  'quinoa': 3.0,
};