import type { FoodCategory, RawFoodEntry } from '../types/expert';
import {
  bodybuildingFoods,
  calculateNutrition,
  convertCookedToRaw,
  convertRawToCooked,
} from './bodybuildingFoods';
import indianFoods, { type LocalFood } from './indianFoods';

/**
 * Supplements for lifters and athletes.
 * Nutrition values are per 100g of the supplement.
 */
export const supplements: RawFoodEntry[] = [
  { id: 'whey_protein', name: 'Whey Protein Powder', category: 'supplements', nutritionPer100g: { calories: 400, protein: 80, carbs: 8, fat: 6, fiber: 0, sugar: 4, sodium: 200, calcium: 500, magnesium: 70, zinc: 1, potassium: 300 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 30 },
  { id: 'casein_protein', name: 'Casein Protein Powder', category: 'supplements', nutritionPer100g: { calories: 380, protein: 75, carbs: 6, fat: 3, fiber: 0, sugar: 3, sodium: 180, calcium: 600, magnesium: 50, zinc: 1 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 30 },
  { id: 'mass_gainer', name: 'Mass Gainer Powder', category: 'supplements', nutritionPer100g: { calories: 380, protein: 25, carbs: 65, fat: 5, fiber: 2, sugar: 15, sodium: 250, calcium: 200, magnesium: 30, potassium: 200 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 100 },
  { id: 'creatine', name: 'Creatine Monohydrate', category: 'supplements', nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 5 },
  { id: 'bcaa', name: 'BCAA Powder', category: 'supplements', nutritionPer100g: { calories: 400, protein: 90, carbs: 5, fat: 0, fiber: 0, sugar: 2, sodium: 50, calcium: 100, magnesium: 20, potassium: 50 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 10 },
  { id: 'pre_workout', name: 'Pre-Workout', category: 'supplements', nutritionPer100g: { calories: 50, protein: 0, carbs: 10, fat: 0, fiber: 0, sugar: 5, sodium: 200, calcium: 200, magnesium: 50, potassium: 300, vitaminC: 500, vitaminB6: 10, vitaminB12: 25 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 10 },
  { id: 'glutamine', name: 'L-Glutamine', category: 'supplements', nutritionPer100g: { calories: 350, protein: 88, carbs: 0, fat: 0, fiber: 0, sodium: 10 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 5 },
  { id: 'fish_oil', name: 'Fish Oil (Omega-3)', category: 'supplements', nutritionPer100g: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0, vitaminD: 250, vitaminE: 30 }, cookedConversionFactor: 1.0, servingUnit: 'ml', defaultServing: 5 },
  { id: 'multivitamin', name: 'Multivitamin', category: 'supplements', nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, vitaminA: 5000, vitaminC: 6000, vitaminD: 1000, vitaminE: 300, vitaminK: 800, vitaminB6: 20, vitaminB12: 50, calcium: 2000, iron: 100, magnesium: 2000, zinc: 100, potassium: 2000 }, cookedConversionFactor: 1.0, servingUnit: 'tablet', defaultServing: 1 },
  { id: 'vitamin_d', name: 'Vitamin D3', category: 'supplements', nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, vitaminD: 50000, calcium: 1000 }, cookedConversionFactor: 1.0, servingUnit: 'tablet', defaultServing: 1 },
  { id: 'magnesium', name: 'Magnesium', category: 'supplements', nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, magnesium: 40000 }, cookedConversionFactor: 1.0, servingUnit: 'tablet', defaultServing: 1 },
  { id: 'zinc', name: 'Zinc', category: 'supplements', nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, zinc: 15000 }, cookedConversionFactor: 1.0, servingUnit: 'tablet', defaultServing: 1 },
  { id: 'protein_bar', name: 'Protein Bar', category: 'supplements', nutritionPer100g: { calories: 380, protein: 30, carbs: 40, fat: 12, fiber: 5, sugar: 20, sodium: 300, calcium: 300, magnesium: 60, iron: 3, zinc: 2, potassium: 200, vitaminD: 50, vitaminB12: 10 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 60 },
  { id: 'electrolytes', name: 'Electrolyte Powder', category: 'supplements', nutritionPer100g: { calories: 20, protein: 0, carbs: 5, fat: 0, fiber: 0, sugar: 3, sodium: 800, potassium: 2000, calcium: 500, magnesium: 200 }, cookedConversionFactor: 1.0, servingUnit: 'g', defaultServing: 5 },
];

/**
 * Combined RawFoodEntry database for Expert Mode.
 * Bodybuilding staples + supplements.
 */
export const allFoods: RawFoodEntry[] = [...bodybuildingFoods, ...supplements];

/** Convert a RawFoodEntry into the LocalFood search shape. */
export function toLocalFood(food: RawFoodEntry): LocalFood {
  // RawFoodEntry.nutritionPer100g stores values per 100g, but LocalFood /
  // FoodSearchResult are expected to be per-serving (the nutrition for one
  // servingSize). Scale so search results and logged meal items show
  // accurate per-serving macros (e.g. whey: 400 kcal/100g x 30g = 120 kcal).
  const factor = food.defaultServing / 100;
  return {
    name: food.name,
    category: food.category,
    calories: Math.round(food.nutritionPer100g.calories * factor),
    protein: Math.round(food.nutritionPer100g.protein * factor * 10) / 10,
    carbs: Math.round(food.nutritionPer100g.carbs * factor * 10) / 10,
    fat: Math.round(food.nutritionPer100g.fat * factor * 10) / 10,
    servingSize: food.defaultServing,
    servingUnit: food.servingUnit,
  };
}

/**
 * Unified searchable database for the regular meal log search.
 * Indian foods + bodybuilding staples + supplements.
 */
export const unifiedFoods: LocalFood[] = [
  ...indianFoods,
  ...bodybuildingFoods.map(toLocalFood),
  ...supplements.map(toLocalFood),
];

/** Search the unified RawFoodEntry database by name. */
export function searchFoods(query: string): RawFoodEntry[] {
  const q = query.toLowerCase();
  return allFoods.filter((f) => f.name.toLowerCase().includes(q));
}

export function getFoodById(id: string): RawFoodEntry | undefined {
  return allFoods.find((f) => f.id === id);
}

export function getFoodsByCategory(category: FoodCategory): RawFoodEntry[] {
  return allFoods.filter((f) => f.category === category);
}

export { indianFoods, calculateNutrition, convertRawToCooked, convertCookedToRaw };
export type { LocalFood };

