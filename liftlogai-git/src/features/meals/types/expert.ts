export type FoodCategory = 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruit' | 'supplements';

export type LogMode = 'raw' | 'cooked';

export interface RawFoodEntry {
  id: string;
  name: string;
  category: FoodCategory;
  /** Nutrition per 100g raw */
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    potassium?: number;
    calcium?: number;
    magnesium?: number;
    iron?: number;
    zinc?: number;
    vitaminA?: number;
    vitaminB6?: number;
    vitaminB12?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminK?: number;
  };
  /** Cooked weight conversion factor (cooked weight = raw weight * factor) */
  cookedConversionFactor: number;
  servingUnit: string;
  defaultServing: number;
}

export interface ExpertNutritionTotals {
  calories: number;
  caloriesGoal: number;
  caloriesRemaining: number;
  caloriesPercentage: number;
  protein: number;
  proteinGoal: number;
  proteinRemaining: number;
  proteinPercentage: number;
  carbs: number;
  carbsGoal: number;
  carbsRemaining: number;
  carbsPercentage: number;
  fat: number;
  fatGoal: number;
  fatRemaining: number;
  fatPercentage: number;
  fiber: number;
  fiberGoal: number;
  fiberRemaining: number;
  fiberPercentage: number;
  sugar: number;
  sugarGoal: number;
  sugarRemaining: number;
  sugarPercentage: number;
  sodium: number;
  sodiumGoal: number;
  sodiumRemaining: number;
  sodiumPercentage: number;
  cholesterol: number;
  cholesterolGoal: number;
  cholesterolRemaining: number;
  cholesterolPercentage: number;
  water: number;
  waterGoal: number;
  waterRemaining: number;
  waterPercentage: number;
}

export interface MicronutrientEntry {
  name: string;
  current: number;
  target: number;
  remaining: number;
  unit: string;
}

export interface MealQualityScore {
  total: number;
  proteinQuality: number;
  micronutrientDensity: number;
  fiber: number;
  healthyFats: number;
  foodDiversity: number;
  processedFoodPenalty: number;
}

export interface AIInsight {
  type: 'warning' | 'success' | 'info' | 'tip';
  message: string;
  icon: string;
}

export interface CompetitionPrepInputs {
  currentWeight: number;
  targetWeight: number;
  bodyFatPercentage: number;
  weeksUntilShow: number;
  targetWeeklyLoss: number;
  dailyActivity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  trainingDays: number;
  cardioSessions: number;
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
}

export interface RawFoodLog {
  id: string;
  foodId: string;
  foodName: string;
  category: FoodCategory;
  rawWeight: number;
  logMode: LogMode;
  cookedWeight?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  magnesium?: number;
  iron?: number;
  zinc?: number;
  vitaminA?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  timestamp: string;
  mealId: string;
}

export interface MealBuilderEntry {
  id: string;
  food: RawFoodEntry;
  rawWeight: number;
  logMode: LogMode;
}

export interface MealBuilderMeal {
  id: string;
  name: string;
  entries: MealBuilderEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  score: number;
}

export interface NutritionTimelinePoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight?: number;
  water?: number;
}

export interface GoalTrackingData {
  maintenanceCalories: number;
  cutCalories: number;
  bulkCalories: number;
  deficit: number;
  surplus: number;
  expectedWeeklyChange: number;
  projectedGoalDate: string;
}

export interface PeakWeekDay {
  day: number;
  water: number;
  sodium: number;
  carbs: number;
  weight: number;
  notes: string;
}

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