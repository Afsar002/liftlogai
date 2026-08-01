import type { EnhancedFood, FoodNutrition, LogMode } from '../types/nutrition';
import { EMPTY_FOOD_NUTRITION } from '../types/nutrition';
import { v4 as uuidv4 } from 'uuid';
import { NutritionEngine } from './NutritionEngine';
import type { ScaledNutrition } from './nutritionCalculator';

export interface RecipeIngredient {
  id: string;
  food: EnhancedFood;
  quantity: number;
  servingUnit: string;
  logMode: LogMode;
  rawWeight?: number;
  cookedWeight?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  servings: number;
  prepTime?: number;
  cookTime?: number;
  instructions?: string[];
  tags?: string[];
  mealType?: string;
  qualityScore: number;
  nutritionPerServing: FoodNutrition;
  nutritionTotal: FoodNutrition;
  cookingYield?: number;
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Convert a ScaledNutrition (from NutritionEngine) into a FoodNutrition.
 * Every nutrient is preserved — no nutrient is dropped.
 */
function scaledToFoodNutrition(s: ScaledNutrition): FoodNutrition {
  return {
    calories: s.calories,
    protein: s.protein,
    carbs: s.carbs,
    fat: s.fat,
    fiber: s.fiber,
    sugar: s.sugar,
    sodium: s.sodium,
    cholesterol: s.cholesterol,
    potassium: s.potassium,
    calcium: s.calcium,
    magnesium: s.magnesium,
    iron: s.iron,
    zinc: s.zinc,
    vitaminA: s.vitaminA,
    vitaminB6: s.vitaminB6,
    vitaminB12: s.vitaminB12,
    vitaminC: s.vitaminC,
    vitaminD: s.vitaminD,
    vitaminE: s.vitaminE,
    vitaminK: s.vitaminK,
  };
}

/**
 * Adapt an EnhancedFood (recipe ingredient shape) to the shape expected by
 * NutritionEngine.calculateFoodNutrition / calculateRecipeNutrition.
 *
 * EnhancedFood stores its conversion as a CookedConversion object
 * (rawToCookedFactor), while the engine expects a flat cookedConversionFactor
 * number. We map between the two here so the engine remains the only place
 * that performs nutrition math.
 */
function toEngineFood(food: EnhancedFood): {
  nutritionPer100g: typeof food.nutritionPer100g;
  cookedConversionFactor: number;
} {
  return {
    nutritionPer100g: food.nutritionPer100g,
    cookedConversionFactor: food.cookedConversion?.rawToCookedFactor ?? 1.0,
  };
}

export class RecipeBuilder {
  /**
   * Calculate nutrition for a single ingredient at given quantity.
   *
   * DELEGATES to NutritionEngine — RecipeBuilder orchestrates recipes and
   * never performs nutrition math itself. This guarantees that every
   * nutrient (including zinc, vitaminB6, vitaminB12) is preserved.
   */
  static calculateIngredientNutrition(ingredient: RecipeIngredient): FoodNutrition {
    const scaled = NutritionEngine.calculateFoodNutrition(
      toEngineFood(ingredient.food),
      ingredient.quantity,
      ingredient.logMode,
    );
    return scaledToFoodNutrition(scaled);
  }

  /**
   * Calculate total nutrition for a recipe.
   *
   * DELEGATES to NutritionEngine.calculateRecipeNutrition so that all
   * nutrients are summed consistently by the single calculation authority.
   */
  static calculateRecipeNutrition(recipe: Recipe): FoodNutrition {
    const scaled = NutritionEngine.calculateRecipeNutrition(
      recipe.ingredients.map(i => ({
        food: toEngineFood(i.food),
        quantity: i.quantity,
        logMode: i.logMode,
      })),
    );
    return scaledToFoodNutrition(scaled);
  }

  /**
   * Calculate nutrition per serving.
   * Scales the total (computed via NutritionEngine) by the serving count.
   */
  static calculatePerServing(recipe: Recipe): FoodNutrition {
    const total = this.calculateRecipeNutrition(recipe);
    const servings = Math.max(1, recipe.servings);
    const round1 = (v: number) => Math.round(v * 10) / 10;
    const round0 = (v: number) => Math.round(v);
    return {
      calories: round0(total.calories / servings),
      protein: round1(total.protein / servings),
      carbs: round1(total.carbs / servings),
      fat: round1(total.fat / servings),
      fiber: round1(total.fiber / servings),
      sugar: round1(total.sugar / servings),
      sodium: round0(total.sodium / servings),
      cholesterol: round0(total.cholesterol / servings),
      potassium: round0(total.potassium / servings),
      calcium: round0(total.calcium / servings),
      magnesium: round0(total.magnesium / servings),
      iron: round0(total.iron / servings),
      zinc: round1(total.zinc / servings),
      vitaminA: round1(total.vitaminA / servings),
      vitaminB6: round1(total.vitaminB6 / servings),
      vitaminB12: round1(total.vitaminB12 / servings),
      vitaminC: round1(total.vitaminC / servings),
      vitaminD: round1(total.vitaminD / servings),
      vitaminE: round1(total.vitaminE / servings),
      vitaminK: round1(total.vitaminK / servings),
    };
  }

  /**
   * Calculate recipe quality score
   */
  static calculateQualityScore(recipe: Recipe): number {
    const items = recipe.ingredients;
    if (items.length === 0) return 0;

    const hasProtein = items.some(i => ['protein', 'seafood'].includes(i.food.category));
    const hasVeggies = items.some(i => i.food.category === 'vegetables');
    const hasFruit = items.some(i => i.food.category === 'fruit');
    const hasHealthyFats = items.some(i => ['fats', 'seafood'].includes(i.food.category));
    const hasCarbs = items.some(i => ['carbs', 'grains'].includes(i.food.category));
    const hasDiversity = new Set(items.map(i => i.food.category)).size >= 3;

    let score = 0;
    if (hasProtein) score += 25;
    if (hasVeggies) score += 20;
    if (hasFruit) score += 15;
    if (hasHealthyFats) score += 20;
    if (hasCarbs) score += 20;
    if (hasDiversity) score += 10;

    const perServing = this.calculatePerServing(recipe);
    if (perServing.fiber >= 5) score += 10;

    return Math.min(100, score);
  }

  /**
   * Create a new recipe
   */
  static createRecipe(
    name: string,
    ingredients: RecipeIngredient[],
    servings: number,
    options?: {
      description?: string;
      prepTime?: number;
      cookTime?: number;
      instructions?: string[];
      tags?: string[];
      mealType?: string;
      cookingYield?: number;
    },
  ): Recipe {
    const recipe: Recipe = {
      id: uuidv4(),
      name,
      description: options?.description,
      ingredients,
      servings,
      prepTime: options?.prepTime,
      cookTime: options?.cookTime,
      instructions: options?.instructions,
      tags: options?.tags,
      mealType: options?.mealType,
      qualityScore: 0,
      nutritionPerServing: { ...EMPTY_FOOD_NUTRITION },
      nutritionTotal: { ...EMPTY_FOOD_NUTRITION },
      cookingYield: options?.cookingYield,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    recipe.nutritionTotal = this.calculateRecipeNutrition(recipe);
    recipe.nutritionPerServing = this.calculatePerServing(recipe);
    recipe.qualityScore = this.calculateQualityScore(recipe);

    return recipe;
  }

  /**
   * Scale a recipe to different number of servings
   */
  static scaleRecipe(recipe: Recipe, newServings: number): Recipe {
    const scaleFactor = newServings / recipe.servings;
    const scaledIngredients: RecipeIngredient[] = recipe.ingredients.map(ing => ({
      ...ing,
      quantity: Math.round(ing.quantity * scaleFactor * 10) / 10,
    }));

    return this.createRecipe(
      recipe.name,
      scaledIngredients,
      newServings,
      {
        description: recipe.description,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        instructions: recipe.instructions,
        tags: recipe.tags,
        mealType: recipe.mealType,
        cookingYield: recipe.cookingYield,
      },
    );
  }

  /**
   * Convert raw weight to cooked weight using cooking yield
   */
  static convertRawToCooked(rawWeight: number, cookingYield: number): number {
    return Math.round(rawWeight * cookingYield * 10) / 10;
  }

  /**
   * Convert cooked weight to raw weight using cooking yield
   */
  static convertCookedToRaw(cookedWeight: number, cookingYield: number): number {
    return Math.round((cookedWeight / cookingYield) * 10) / 10;
  }
}