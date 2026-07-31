import type { EnhancedFood, FoodNutrition, LogMode } from '../types/nutrition';
import { EMPTY_FOOD_NUTRITION } from '../types/nutrition';
import { v4 as uuidv4 } from 'uuid';

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

export class RecipeBuilder {
  /**
   * Calculate nutrition for a single ingredient at given quantity
   */
  static calculateIngredientNutrition(ingredient: RecipeIngredient): FoodNutrition {
    const { food, quantity, servingUnit, logMode } = ingredient;
    const actualWeight = logMode === 'cooked' && food.cookedConversion
      ? quantity / food.cookedConversion.rawToCookedFactor
      : quantity;

    const multiplier = actualWeight / 100;
    const base = food.nutritionPer100g;

    return {
      calories: Math.round(base.calories * multiplier),
      protein: Math.round(base.protein * multiplier * 10) / 10,
      carbs: Math.round(base.carbs * multiplier * 10) / 10,
      fat: Math.round(base.fat * multiplier * 10) / 10,
      fiber: Math.round(base.fiber * multiplier * 10) / 10,
      sugar: Math.round((base.sugar || 0) * multiplier * 10) / 10,
      sodium: Math.round((base.sodium || 0) * multiplier),
      cholesterol: Math.round((base.cholesterol || 0) * multiplier),
      potassium: Math.round((base.potassium || 0) * multiplier),
      calcium: Math.round((base.calcium || 0) * multiplier),
      magnesium: Math.round((base.magnesium || 0) * multiplier),
      iron: Math.round((base.iron || 0) * multiplier),
      vitaminA: Math.round((base.vitaminA || 0) * multiplier * 10) / 10,
      vitaminC: Math.round((base.vitaminC || 0) * multiplier * 10) / 10,
      vitaminD: Math.round((base.vitaminD || 0) * multiplier * 10) / 10,
      vitaminE: Math.round((base.vitaminE || 0) * multiplier * 10) / 10,
      vitaminK: Math.round((base.vitaminK || 0) * multiplier * 10) / 10,
    };
  }

  /**
   * Calculate total nutrition for a recipe
   */
  static calculateRecipeNutrition(recipe: Recipe): FoodNutrition {
    return recipe.ingredients.reduce((acc, ingredient) => {
      const nutrition = this.calculateIngredientNutrition(ingredient);
      return {
        calories: acc.calories + nutrition.calories,
        protein: acc.protein + nutrition.protein,
        carbs: acc.carbs + nutrition.carbs,
        fat: acc.fat + nutrition.fat,
        fiber: acc.fiber + nutrition.fiber,
        sugar: acc.sugar + nutrition.sugar,
        sodium: acc.sodium + nutrition.sodium,
        cholesterol: acc.cholesterol + nutrition.cholesterol,
        potassium: acc.potassium + nutrition.potassium,
        calcium: acc.calcium + nutrition.calcium,
        magnesium: acc.magnesium + nutrition.magnesium,
        iron: acc.iron + nutrition.iron,
        vitaminA: acc.vitaminA + nutrition.vitaminA,
        vitaminC: acc.vitaminC + nutrition.vitaminC,
        vitaminD: acc.vitaminD + nutrition.vitaminD,
        vitaminE: acc.vitaminE + nutrition.vitaminE,
        vitaminK: acc.vitaminK + nutrition.vitaminK,
      };
    }, { ...EMPTY_FOOD_NUTRITION });
  }

  /**
   * Calculate nutrition per serving
   */
  static calculatePerServing(recipe: Recipe): FoodNutrition {
    const total = this.calculateRecipeNutrition(recipe);
    const servings = Math.max(1, recipe.servings);
    return {
      calories: Math.round(total.calories / servings),
      protein: Math.round((total.protein / servings) * 10) / 10,
      carbs: Math.round((total.carbs / servings) * 10) / 10,
      fat: Math.round((total.fat / servings) * 10) / 10,
      fiber: Math.round((total.fiber / servings) * 10) / 10,
      sugar: Math.round((total.sugar / servings) * 10) / 10,
      sodium: Math.round(total.sodium / servings),
      cholesterol: Math.round(total.cholesterol / servings),
      potassium: Math.round(total.potassium / servings),
      calcium: Math.round(total.calcium / servings),
      magnesium: Math.round(total.magnesium / servings),
      iron: Math.round(total.iron / servings),
      vitaminA: Math.round((total.vitaminA / servings) * 10) / 10,
      vitaminC: Math.round((total.vitaminC / servings) * 10) / 10,
      vitaminD: Math.round((total.vitaminD / servings) * 10) / 10,
      vitaminE: Math.round((total.vitaminE / servings) * 10) / 10,
      vitaminK: Math.round((total.vitaminK / servings) * 10) / 10,
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
