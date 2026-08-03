import type { NutritionDay, AIInsight, FoodNutrition, NutritionGoals } from '../types/nutrition';
import { DEFAULT_NUTRITION_GOALS } from '../types/nutrition';

export class AIInsightService {
  /**
   * Generate AI nutrition insights based on current day's data
   */
  static generateInsights(
    totals: FoodNutrition,
    goals: NutritionGoals = DEFAULT_NUTRITION_GOALS,
    options?: { proteinPerKg?: number; bodyweight?: number; trainingToday?: boolean }
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Protein analysis
    const proteinPercent = goals.protein > 0 ? (totals.protein / goals.protein) * 100 : 0;
    if (proteinPercent < 50) {
      insights.push({
        type: 'critical', category: 'protein', priority: 9,
        message: `Protein is critically low at ${Math.round(totals.protein)}g (${Math.round(proteinPercent)}% of target). Muscle recovery may be compromised.`,
        icon: '🥩', actionable: true,
        suggestion: 'Add a high-protein meal with 30-40g protein. Consider chicken breast, egg whites, or a whey shake.',
      });
    } else if (proteinPercent < 75) {
      insights.push({
        type: 'warning', category: 'protein', priority: 7,
        message: `Protein is ${Math.round(goals.protein - totals.protein)}g below target. Consider adding a protein source.`,
        icon: '🥩', actionable: true,
        suggestion: 'Add 20-30g protein from lean meat, eggs, or protein powder.',
      });
    } else if (proteinPercent >= 100) {
      insights.push({
        type: 'success', category: 'protein', priority: 5,
        message: 'Protein intake is excellent for muscle recovery and growth!',
        icon: '💪',
      });
    }

    // Fiber analysis
    const fiberPercent = goals.fiber > 0 ? (totals.fiber / goals.fiber) * 100 : 0;
    if (fiberPercent < 50) {
      insights.push({
        type: 'warning', category: 'fiber', priority: 6,
        message: `Fiber intake is low at ${Math.round(totals.fiber)}g. Aim for ${goals.fiber}g for digestive health and satiety.`,
        icon: '🥦', actionable: true,
        suggestion: 'Add vegetables, oats, or chia seeds to your next meal.',
      });
    } else if (fiberPercent >= 100) {
      insights.push({
        type: 'success', category: 'fiber', priority: 4,
        message: 'Excellent fiber intake! Great for digestive health and satiety.',
        icon: '✅',
      });
    }

    // Carbohydrate analysis
    const carbsPercent = goals.carbs > 0 ? (totals.carbs / goals.carbs) * 100 : 0;
    if (options?.trainingToday && carbsPercent < 60) {
      insights.push({
        type: 'warning', category: 'carbs', priority: 7,
        message: `Carb intake is low for training days. Consider adding complex carbs for energy.`,
        icon: '🌾', actionable: true,
        suggestion: 'Add rice, oats, or sweet potatoes to fuel your workout.',
      });
    } else if (carbsPercent >= 80 && carbsPercent <= 110) {
      insights.push({
        type: 'success', category: 'carbs', priority: 3,
        message: 'Carbohydrate intake is well-optimized for training performance.',
        icon: '✅',
      });
    }

    // Calorie analysis
    const calPercent = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;
    if (calPercent < 40) {
      insights.push({
        type: 'critical', category: 'calories', priority: 8,
        message: `Calorie intake is very low (${Math.round(totals.calories)} kcal). This may slow metabolism and impair recovery.`,
        icon: '🔥', actionable: true,
        suggestion: 'Try to eat more frequent meals throughout the day.',
      });
    } else if (calPercent > 120) {
      insights.push({
        type: 'warning', category: 'calories', priority: 5,
        message: `Calorie intake exceeds target by ${Math.round(totals.calories - goals.calories)} kcal. Adjust portions if cutting.`,
        icon: '⚠️',
      });
    }

    // Sodium check
    const sodiumPercent = goals.sodium > 0 ? (totals.sodium / goals.sodium) * 100 : 0;
    if (sodiumPercent > 100) {
      insights.push({
        type: 'warning', category: 'sodium', priority: 5,
        message: `Sodium intake is above target (${Math.round(totals.sodium)}mg). Monitor intake for optimal health.`,
        icon: '🧂',
      });
    }

    // Micronutrient checks
    if (totals.potassium < 2000) {
      insights.push({
        type: 'info', category: 'micronutrient', priority: 4,
        message: 'Potassium intake may be low. Add bananas, potatoes, or spinach for electrolyte balance.',
        icon: '🍌', actionable: true,
      });
    }

    if (totals.calcium < 500) {
      insights.push({
        type: 'info', category: 'micronutrient', priority: 3,
        message: 'Calcium intake could be improved. Consider dairy, leafy greens, or fortified foods.',
        icon: '🥛', actionable: true,
      });
    }

    // Meal timing suggestion
    if (options?.trainingToday && calPercent < 50) {
      insights.push({
        type: 'tip', category: 'timing', priority: 4,
        message: 'Consider spreading meals evenly throughout the day for better nutrient partitioning and recovery.',
        icon: '⏰',
      });
    }

    return insights.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get a human-readable summary of daily nutrition
   */
  static getDailySummary(totals: FoodNutrition, goals: NutritionGoals): string {
    const calPercent = Math.round((totals.calories / goals.calories) * 100);
    const proteinPercent = Math.round((totals.protein / goals.protein) * 100);
    const carbsPercent = Math.round((totals.carbs / goals.carbs) * 100);
    const fatPercent = Math.round((totals.fat / goals.fat) * 100);

    return `${totals.calories} kcal (${calPercent}%) · P: ${totals.protein}g (${proteinPercent}%) · C: ${totals.carbs}g (${carbsPercent}%) · F: ${totals.fat}g (${fatPercent}%)`;
  }
}