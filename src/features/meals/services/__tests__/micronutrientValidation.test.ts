/**
 * Manual validation tests for micronutrient preservation end-to-end.
 *
 * Verifies that zinc, vitaminB6, and vitaminB12 (and all other nutrients)
 * flow correctly through:
 *   1. NutritionEngine.calculateNutritionPreview (Raw Food Mode path)
 *   2. NutritionEngine.calculateFoodNutrition (raw/cooked conversion)
 *   3. NutritionDayService.calculateDailyTotals (NutritionDay totals)
 *   4. NutritionDayService.calculateMicronutrients (micronutrient status)
 *   5. RecipeBuilder.calculateIngredientNutrition / calculateRecipeNutrition
 *
 * Foods validated:
 *   - Chicken Breast (Raw)
 *   - Chicken Breast (Cooked)
 *   - Rice (Raw)
 *   - Rice (Cooked)
 *   - Eggs (Whole Eggs)
 *   - Oats
 */

import * as assert from 'node:assert';
import { describe, it } from 'node:test';

import { NutritionEngine } from '../NutritionEngine';
import { NutritionDayService } from '../NutritionDayService';
import { RecipeBuilder } from '../RecipeBuilder';
import type { RecipeIngredient } from '../RecipeBuilder';
import type { EnhancedMeal, FoodNutrition } from '../../types/nutrition';
import { EMPTY_FOOD_NUTRITION } from '../../types/nutrition';
import type { RawFoodEntry } from '../../types/expert';

// ================================================================
// FOOD FIXTURES (from bodybuildingFoods.ts)
// ================================================================

const CHICKEN_BREAST: RawFoodEntry = {
  id: 'chicken_breast',
  name: 'Chicken Breast (Raw)',
  category: 'protein',
  nutritionPer100g: {
    calories: 120, protein: 23, carbs: 0, fat: 1.9, fiber: 0,
    sodium: 45, potassium: 256, calcium: 5, magnesium: 29, iron: 0.9,
    zinc: 1.0, vitaminA: 16, vitaminB6: 0.5, vitaminB12: 0.3,
  },
  cookedConversionFactor: 0.75,
  servingUnit: 'g',
  defaultServing: 100,
};

const RAW_RICE: RawFoodEntry = {
  id: 'raw_rice',
  name: 'Raw Rice',
  category: 'carbs',
  nutritionPer100g: {
    calories: 365, protein: 7.1, carbs: 80, fat: 0.7, fiber: 1.4,
    sodium: 5, potassium: 115, calcium: 28, magnesium: 25, iron: 0.8,
    zinc: 1.1, vitaminB6: 0.2, vitaminE: 0.1,
  },
  cookedConversionFactor: 3.0,
  servingUnit: 'g',
  defaultServing: 100,
};

const WHOLE_EGGS: RawFoodEntry = {
  id: 'whole_eggs',
  name: 'Whole Eggs',
  category: 'protein',
  nutritionPer100g: {
    calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0,
    cholesterol: 373, sodium: 142, potassium: 138, calcium: 56, magnesium: 12,
    iron: 1.8, zinc: 1.3, vitaminA: 160, vitaminB6: 0.1, vitaminB12: 1.1,
    vitaminD: 2.0, vitaminE: 1.0, vitaminK: 0.3,
  },
  cookedConversionFactor: 1.0,
  servingUnit: 'g',
  defaultServing: 100,
};

const RAW_OATS: RawFoodEntry = {
  id: 'raw_oats',
  name: 'Raw Oats',
  category: 'carbs',
  nutritionPer100g: {
    calories: 389, protein: 17, carbs: 66, fat: 6.9, fiber: 10.6,
    sodium: 2, potassium: 429, calcium: 54, magnesium: 177, iron: 4.7,
    zinc: 4.0, vitaminB6: 0.1, vitaminE: 0.4, vitaminK: 2.0,
  },
  cookedConversionFactor: 1.0,
  servingUnit: 'g',
  defaultServing: 100,
};

// ================================================================
// HELPERS
// ================================================================

/** Build an EnhancedMeal from a single RawFoodEntry + weight + mode */
function buildMeal(food: RawFoodEntry, weight: number, mode: 'raw' | 'cooked'): EnhancedMeal {
  const nutrition = NutritionEngine.calculateNutritionPreview(food, weight, mode);
  return {
    id: 'meal-1',
    date: '2026-01-01',
    mealType: 'Breakfast',
    mealTime: '2026-01-01',
    items: [{
      id: 'item-1',
      mealId: 'meal-1',
      foodId: food.id,
      foodName: food.name,
      foodCategory: food.category as any,
      quantity: weight,
      servingSize: 100,
      servingUnit: 'g',
      logMode: mode,
      nutrition,
    }],
    totalCalories: nutrition.calories,
    totalProtein: nutrition.protein,
    totalCarbs: nutrition.carbs,
    totalFat: nutrition.fat,
    totalFiber: nutrition.fiber,
    qualityScore: 0,
  };
}

/** Convert a RawFoodEntry to an EnhancedFood for RecipeBuilder */
function toEnhancedFood(food: RawFoodEntry) {
  return {
    id: food.id,
    name: food.name,
    category: food.category as any,
    servingSize: food.defaultServing,
    servingUnit: food.servingUnit,
    nutritionPer100g: {
      ...EMPTY_FOOD_NUTRITION,
      calories: food.nutritionPer100g.calories,
      protein: food.nutritionPer100g.protein,
      carbs: food.nutritionPer100g.carbs,
      fat: food.nutritionPer100g.fat,
      fiber: food.nutritionPer100g.fiber,
      sugar: food.nutritionPer100g.sugar ?? 0,
      sodium: food.nutritionPer100g.sodium ?? 0,
      cholesterol: food.nutritionPer100g.cholesterol ?? 0,
      potassium: food.nutritionPer100g.potassium ?? 0,
      calcium: food.nutritionPer100g.calcium ?? 0,
      magnesium: food.nutritionPer100g.magnesium ?? 0,
      iron: food.nutritionPer100g.iron ?? 0,
      zinc: food.nutritionPer100g.zinc ?? 0,
      vitaminA: food.nutritionPer100g.vitaminA ?? 0,
      vitaminB6: food.nutritionPer100g.vitaminB6 ?? 0,
      vitaminB12: food.nutritionPer100g.vitaminB12 ?? 0,
      vitaminC: food.nutritionPer100g.vitaminC ?? 0,
      vitaminD: food.nutritionPer100g.vitaminD ?? 0,
      vitaminE: food.nutritionPer100g.vitaminE ?? 0,
      vitaminK: food.nutritionPer100g.vitaminK ?? 0,
    },
    cookedConversion: { rawToCookedFactor: food.cookedConversionFactor, method: 'raw' as any },
    verified: true,
    source: 'local' as any,
  };
}

// ================================================================
// VALIDATION TESTS
// ================================================================

describe('Micronutrient Validation — Chicken Breast (Raw)', () => {
  it('100g raw chicken breast preserves zinc, B6, B12', () => {
    const n = NutritionEngine.calculateNutritionPreview(CHICKEN_BREAST, 100, 'raw');
    assert.ok(n.zinc > 0, `zinc should be > 0, got ${n.zinc}`);
    assert.ok(n.vitaminB6 > 0, `vitaminB6 should be > 0, got ${n.vitaminB6}`);
    assert.ok(n.vitaminB12 > 0, `vitaminB12 should be > 0, got ${n.vitaminB12}`);
    assert.strictEqual(n.zinc, 1.0);
    assert.strictEqual(n.vitaminB6, 0.5);
    assert.strictEqual(n.vitaminB12, 0.3);
  });
});

describe('Micronutrient Validation — Chicken Breast (Cooked)', () => {
  it('187.5g cooked chicken (≡250g raw) preserves zinc, B6, B12', () => {
    const cooked = NutritionEngine.calculateNutritionPreview(CHICKEN_BREAST, 187.5, 'cooked');
    const raw = NutritionEngine.calculateNutritionPreview(CHICKEN_BREAST, 250, 'raw');
    // Cooked 187.5g should equal raw 250g nutritionally
    assert.strictEqual(cooked.zinc, raw.zinc);
    assert.strictEqual(cooked.vitaminB6, raw.vitaminB6);
    assert.strictEqual(cooked.vitaminB12, raw.vitaminB12);
    assert.ok(cooked.zinc > 0);
    assert.ok(cooked.vitaminB6 > 0);
    assert.ok(cooked.vitaminB12 > 0);
  });
});

describe('Micronutrient Validation — Rice (Raw)', () => {
  it('100g raw rice preserves zinc, B6', () => {
    const n = NutritionEngine.calculateNutritionPreview(RAW_RICE, 100, 'raw');
    assert.ok(n.zinc > 0, `zinc should be > 0, got ${n.zinc}`);
    assert.ok(n.vitaminB6 > 0, `vitaminB6 should be > 0, got ${n.vitaminB6}`);
    assert.strictEqual(n.zinc, 1.1);
    assert.strictEqual(n.vitaminB6, 0.2);
  });
});

describe('Micronutrient Validation — Rice (Cooked)', () => {
  it('300g cooked rice (≡100g raw) preserves zinc, B6', () => {
    const cooked = NutritionEngine.calculateNutritionPreview(RAW_RICE, 300, 'cooked');
    const raw = NutritionEngine.calculateNutritionPreview(RAW_RICE, 100, 'raw');
    assert.strictEqual(cooked.zinc, raw.zinc);
    assert.strictEqual(cooked.vitaminB6, raw.vitaminB6);
    assert.ok(cooked.zinc > 0);
    assert.ok(cooked.vitaminB6 > 0);
  });
});

describe('Micronutrient Validation — Eggs', () => {
  it('100g whole eggs preserves zinc, B6, B12', () => {
    const n = NutritionEngine.calculateNutritionPreview(WHOLE_EGGS, 100, 'raw');
    assert.ok(n.zinc > 0, `zinc should be > 0, got ${n.zinc}`);
    assert.ok(n.vitaminB6 > 0, `vitaminB6 should be > 0, got ${n.vitaminB6}`);
    assert.ok(n.vitaminB12 > 0, `vitaminB12 should be > 0, got ${n.vitaminB12}`);
    assert.strictEqual(n.zinc, 1.3);
    assert.strictEqual(n.vitaminB6, 0.1);
    assert.strictEqual(n.vitaminB12, 1.1);
  });
});

describe('Micronutrient Validation — Oats', () => {
  it('100g raw oats preserves zinc, B6', () => {
    const n = NutritionEngine.calculateNutritionPreview(RAW_OATS, 100, 'raw');
    assert.ok(n.zinc > 0, `zinc should be > 0, got ${n.zinc}`);
    assert.ok(n.vitaminB6 > 0, `vitaminB6 should be > 0, got ${n.vitaminB6}`);
    assert.strictEqual(n.zinc, 4.0);
    assert.strictEqual(n.vitaminB6, 0.1);
  });
});

describe('NutritionDay totals — micronutrients preserved', () => {
  it('daily totals include zinc, B6, B12 from chicken + rice + eggs + oats', () => {
    const meals: EnhancedMeal[] = [
      buildMeal(CHICKEN_BREAST, 200, 'raw'),
      buildMeal(RAW_RICE, 100, 'raw'),
      buildMeal(WHOLE_EGGS, 100, 'raw'),
      buildMeal(RAW_OATS, 50, 'raw'),
    ];
    const totals = NutritionDayService.calculateDailyTotals(meals);
    // zinc: chicken 2.0 + rice 1.1 + eggs 1.3 + oats 2.0 = 6.4
    assert.ok(totals.zinc > 0, `daily zinc should be > 0, got ${totals.zinc}`);
    assert.ok(totals.vitaminB6 > 0, `daily B6 should be > 0, got ${totals.vitaminB6}`);
    assert.ok(totals.vitaminB12 > 0, `daily B12 should be > 0, got ${totals.vitaminB12}`);
    // Sanity: zinc should be roughly 6.4 (2.0 + 1.1 + 1.3 + 2.0)
    assert.ok(Math.abs(totals.zinc - 6.4) < 0.2, `daily zinc ~6.4, got ${totals.zinc}`);
  });
});

describe('Micronutrient Status — zinc, B6, B12 appear', () => {
  it('calculateMicronutrients returns non-zero zinc, B6, B12', () => {
    const meals: EnhancedMeal[] = [
      buildMeal(CHICKEN_BREAST, 200, 'raw'),
      buildMeal(WHOLE_EGGS, 100, 'raw'),
    ];
    const totals = NutritionDayService.calculateDailyTotals(meals);
    const micros = NutritionDayService.calculateMicronutrients(totals);
    const zinc = micros.find(m => m.name === 'Zinc');
    const b6 = micros.find(m => m.name === 'Vitamin B6');
    const b12 = micros.find(m => m.name === 'Vitamin B12');
    assert.ok(zinc, 'Zinc micronutrient status should exist');
    assert.ok(b6, 'Vitamin B6 micronutrient status should exist');
    assert.ok(b12, 'Vitamin B12 micronutrient status should exist');
    assert.ok(zinc!.current > 0, `Zinc current should be > 0, got ${zinc!.current}`);
    assert.ok(b6!.current > 0, `B6 current should be > 0, got ${b6!.current}`);
    assert.ok(b12!.current > 0, `B12 current should be > 0, got ${b12!.current}`);
  });
});

describe('RecipeBuilder — micronutrients preserved via NutritionEngine', () => {
  it('calculateIngredientNutrition preserves zinc, B6, B12', () => {
    const ingredient: RecipeIngredient = {
      id: 'ing-1',
      food: toEnhancedFood(CHICKEN_BREAST),
      quantity: 150,
      servingUnit: 'g',
      logMode: 'raw',
    };
    const n = RecipeBuilder.calculateIngredientNutrition(ingredient);
    assert.ok(n.zinc > 0, `recipe ingredient zinc should be > 0, got ${n.zinc}`);
    assert.ok(n.vitaminB6 > 0, `recipe ingredient B6 should be > 0, got ${n.vitaminB6}`);
    assert.ok(n.vitaminB12 > 0, `recipe ingredient B12 should be > 0, got ${n.vitaminB12}`);
    // 150g chicken: zinc = 1.0 * 1.5 = 1.5
    assert.strictEqual(n.zinc, 1.5);
    assert.strictEqual(n.vitaminB6, 0.8);
    assert.strictEqual(n.vitaminB12, 0.5);
  });

  it('calculateRecipeNutrition sums zinc, B6, B12 across ingredients', () => {
    const recipe = RecipeBuilder.createRecipe('Test Bowl', [
      { id: 'ing-1', food: toEnhancedFood(CHICKEN_BREAST), quantity: 200, servingUnit: 'g', logMode: 'raw' },
      { id: 'ing-2', food: toEnhancedFood(RAW_RICE), quantity: 100, servingUnit: 'g', logMode: 'raw' },
      { id: 'ing-3', food: toEnhancedFood(WHOLE_EGGS), quantity: 100, servingUnit: 'g', logMode: 'raw' },
    ], 2);

    const total = recipe.nutritionTotal;
    assert.ok(total.zinc > 0, `recipe total zinc should be > 0, got ${total.zinc}`);
    assert.ok(total.vitaminB6 > 0, `recipe total B6 should be > 0, got ${total.vitaminB6}`);
    assert.ok(total.vitaminB12 > 0, `recipe total B12 should be > 0, got ${total.vitaminB12}`);
    // zinc: chicken 2.0 + rice 1.1 + eggs 1.3 = 4.4
    assert.ok(Math.abs(total.zinc - 4.4) < 0.1, `recipe total zinc ~4.4, got ${total.zinc}`);

    const perServing = recipe.nutritionPerServing;
    assert.ok(perServing.zinc > 0, `per-serving zinc should be > 0, got ${perServing.zinc}`);
    assert.ok(perServing.vitaminB6 > 0, `per-serving B6 should be > 0, got ${perServing.vitaminB6}`);
    assert.ok(perServing.vitaminB12 > 0, `per-serving B12 should be > 0, got ${perServing.vitaminB12}`);
  });
});

describe('FoodNutrition type — all 20 nutrients present', () => {
  it('EMPTY_FOOD_NUTRITION has all 20 nutrient keys', () => {
    const keys = Object.keys(EMPTY_FOOD_NUTRITION);
    const expected = [
      'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium',
      'cholesterol', 'potassium', 'calcium', 'magnesium', 'iron', 'zinc',
      'vitaminA', 'vitaminB6', 'vitaminB12', 'vitaminC', 'vitaminD',
      'vitaminE', 'vitaminK',
    ];
    for (const key of expected) {
      assert.ok(keys.includes(key), `EMPTY_FOOD_NUTRITION should have ${key}`);
    }
    assert.strictEqual(keys.length, 20, `should have exactly 20 nutrient keys, got ${keys.length}`);
  });
});