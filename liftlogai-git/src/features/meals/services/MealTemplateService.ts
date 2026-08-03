import type { Recipe } from './RecipeBuilder';
import { v4 as uuidv4 } from 'uuid';

export type TemplateType = 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'cardio' | 'hiit' | 'powerlifting' | 'bodybuilding' | 'full_body' | 'contest_prep' | 'lean_bulk' | 'cutting' | 'maintenance' | 'rest';

export interface MealTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description?: string;
  meals: TemplateMeal[];
  dailyNutrition: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  tags?: string[];
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMeal {
  id: string;
  mealType: string;
  recipeId?: string;
  recipe?: Recipe;
  preWorkout?: boolean;
  postWorkout?: boolean;
  notes?: string;
}

export class MealTemplateService {
  static createTemplate(name: string, type: TemplateType, meals: TemplateMeal[], options?: { description?: string; tags?: string[] }): MealTemplate {
    const dailyNutrition = meals.reduce((acc, meal) => {
      if (meal.recipe) {
        return {
          calories: acc.calories + meal.recipe.nutritionTotal.calories,
          protein: acc.protein + meal.recipe.nutritionTotal.protein,
          carbs: acc.carbs + meal.recipe.nutritionTotal.carbs,
          fat: acc.fat + meal.recipe.nutritionTotal.fat,
          fiber: acc.fiber + meal.recipe.nutritionTotal.fiber,
        };
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    return { id: uuidv4(), name, type, description: options?.description, meals, dailyNutrition, tags: options?.tags, favorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  static getTemplatesByType(templates: MealTemplate[], type: TemplateType): MealTemplate[] {
    return templates.filter(t => t.type === type);
  }

  static getFavoriteTemplates(templates: MealTemplate[]): MealTemplate[] {
    return templates.filter(t => t.favorite);
  }

  static toggleFavorite(template: MealTemplate): MealTemplate {
    return { ...template, favorite: !template.favorite, updatedAt: new Date().toISOString() };
  }

  static duplicateTemplate(template: MealTemplate, newName?: string): MealTemplate {
    return { ...template, id: uuidv4(), name: newName || `${template.name} (Copy)`, favorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  static applyTemplate(template: MealTemplate, date: string): TemplateMeal[] {
    return template.meals.map(meal => ({ ...meal, id: uuidv4() }));
  }

  static getDefaultTemplates(): MealTemplate[] {
    const now = new Date().toISOString();
    return [
      { id: 'default-push', name: 'Push Day', type: 'push', description: 'High-carb day for pushing strength', meals: [], dailyNutrition: { calories: 3200, protein: 220, carbs: 360, fat: 70, fiber: 35 }, tags: ['strength', 'high-carb'], favorite: false, createdAt: now, updatedAt: now },
      { id: 'default-pull', name: 'Pull Day', type: 'pull', description: 'Balanced day for pulling strength', meals: [], dailyNutrition: { calories: 3100, protein: 220, carbs: 340, fat: 75, fiber: 35 }, tags: ['strength', 'balanced'], favorite: false, createdAt: now, updatedAt: now },
      { id: 'default-legs', name: 'Leg Day', type: 'legs', description: 'Highest carb day for leg training', meals: [], dailyNutrition: { calories: 3400, protein: 220, carbs: 420, fat: 65, fiber: 40 }, tags: ['strength', 'high-carb'], favorite: false, createdAt: now, updatedAt: now },
      { id: 'default-rest', name: 'Rest Day', type: 'rest', description: 'Lower calorie day for recovery', meals: [], dailyNutrition: { calories: 2700, protein: 220, carbs: 220, fat: 90, fiber: 30 }, tags: ['recovery', 'low-carb'], favorite: false, createdAt: now, updatedAt: now },
      { id: 'default-contest-prep', name: 'Contest Prep', type: 'contest_prep', description: 'Low-calorie high-protein for competition prep', meals: [], dailyNutrition: { calories: 1800, protein: 180, carbs: 150, fat: 50, fiber: 30 }, tags: ['cutting', 'competition'], favorite: false, createdAt: now, updatedAt: now },
      { id: 'default-lean-bulk', name: 'Lean Bulk', type: 'lean_bulk', description: 'Moderate surplus for lean muscle gain', meals: [], dailyNutrition: { calories: 2900, protein: 220, carbs: 300, fat: 80, fiber: 35 }, tags: ['bulking', 'moderate-surplus'], favorite: false, createdAt: now, updatedAt: now },
    ];
  }
}