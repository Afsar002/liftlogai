/**
 * AICoachService — generates personalized coaching from nutrition, workout,
 * recovery, and body composition data.
 *
 * Sits above AIInsightService which only analyzes nutrition macros.
 * AICoachService combines nutrition + workouts + weight trend + recovery.
 */

import type { AIInsight, FoodNutrition, NutritionGoals } from '../types/nutrition';
import type { WorkoutSession } from '../../workout/types/session';
import { NutritionEngine } from './NutritionEngine';

export interface CoachInput {
  totals: FoodNutrition;
  goals: NutritionGoals;
  workouts: WorkoutSession[];
  weightTrend: { date: string; weight: number }[];
  waterIntake: number;
  sleepHours?: number;
  energyLevel?: number;
  bodyFatPercentage?: number;
  currentWeight: number;
  trainingToday?: boolean;
  yesterdayWorkout?: string;
}

export interface CoachMetrics {
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  caloriesPercent: number;
  waterPercent: number;
  weeklyWeightChange: number;
  workoutFrequency: number;
  recovery: number;
}

export interface CoachingRecommendation {
  category: 'nutrition' | 'workout' | 'recovery' | 'hydration' | 'body_composition' | 'timing';
  priority: 1 | 2 | 3;
  message: string;
  suggestion?: string;
  icon: string;
}

export class AICoachService {
  /**
   * Analyze all user data and generate holistic coaching
   */
  static generateCoaching(input: CoachInput): CoachingRecommendation[] {
    const recommendations: CoachingRecommendation[] = [];

    // --- NUTRITION ANALYSIS (delegate to NutritionEngine) ---
    const insights = NutritionEngine.generateInsights(input.totals, input.goals, {
      trainingToday: input.trainingToday,
      bodyweight: input.currentWeight,
    });

    for (const insight of insights) {
      recommendations.push({
        category: 'nutrition',
        priority: insight.priority >= 7 ? 1 : insight.priority >= 5 ? 2 : 3,
        message: insight.message,
        suggestion: insight.suggestion,
        icon: insight.icon,
      });
    }

    // --- WORKOUT-AWARE CARB RECOMMENDATION ---
    if (input.trainingToday) {
      const carbsPercent = input.goals.carbs > 0 ? (input.totals.carbs / input.goals.carbs) * 100 : 0;
      const workoutType = this.inferWorkoutType(input.yesterdayWorkout);
      const workoutNutrition = NutritionEngine.calculateWorkoutNutrition(
        workoutType,
        input.currentWeight,
        60,
      );

      if (carbsPercent < 60) {
        recommendations.push({
          category: 'nutrition',
          priority: 1,
          message: `Training day detected. Carbs at ${Math.round(carbsPercent)}% of target.`,
          suggestion: `Aim for ${workoutNutrition.recommendedCarbs}g carbs to fuel performance. Complex carbs like rice, oats, or sweet potatoes are ideal.`,
          icon: '⚡',
        });
      }

      if (input.totals.calories < workoutNutrition.recommendedCalories) {
        recommendations.push({
          category: 'nutrition',
          priority: 1,
          message: `You may need more energy for today's workout.`,
          suggestion: `Current intake ${input.totals.calories} kcal vs recommended ${workoutNutrition.recommendedCalories} kcal for today's training.`,
          icon: '🔥',
        });
      }
    }

    // --- RECOVERY ANALYSIS ---
    if (input.workouts.length > 0) {
      const recentWorkouts = input.workouts.slice(-7);
      const workoutFrequency = recentWorkouts.length;
      const proteinPercent = input.goals.protein > 0 ? (input.totals.protein / input.goals.protein) * 100 : 0;

      if (workoutFrequency >= 4 && proteinPercent < 80) {
        recommendations.push({
          category: 'recovery',
          priority: 2,
          message: `Training ${workoutFrequency} times this week but protein is below target.`,
          suggestion: 'Prioritize protein for muscle recovery. Consider a protein shake post-workout.',
          icon: '🔋',
        });
      }

      if (workoutFrequency <= 1) {
        recommendations.push({
          category: 'workout',
          priority: 3,
          message: 'Few workouts logged this week. Consistency is key for progress.',
          suggestion: 'Aim for at least 3-4 training sessions per week.',
          icon: '🏋️',
        });
      }
    }

    // --- WEIGHT TREND ANALYSIS ---
    if (input.weightTrend.length >= 3) {
      const weeklyChange = this.calculateWeeklyWeightChange(input.weightTrend);
      const goalDirection = input.goals?.proteinPerKg ? 'lose' : 'maintain';

      if (Math.abs(weeklyChange) > 1.0) {
        recommendations.push({
          category: 'body_composition',
          priority: 2,
          message: `Weight change is rapid (${weeklyChange.toFixed(1)}kg/week).`,
          suggestion: weeklyChange > 0
            ? 'This is faster than recommended. Consider a smaller surplus to limit fat gain.'
            : 'This is faster than recommended. Increase calories slightly to prevent muscle loss.',
          icon: '📉',
        });
      }

      if (weeklyChange > 0 && goalDirection === 'lose') {
        recommendations.push({
          category: 'body_composition',
          priority: 1,
          message: 'Weight is trending upward while you are cutting.',
          suggestion: 'Reduce daily calories by 100-200 kcal or add cardio sessions.',
          icon: '⚠️',
        });
      }
    }

    // --- HYDRATION ---
    const waterGoal = input.goals.water || 3000;
    const waterPercent = input.waterIntake / waterGoal;

    if (waterPercent < 0.5) {
      recommendations.push({
        category: 'hydration',
        priority: 1,
        message: `Hydration is low at ${Math.round(input.waterIntake)}ml of ${waterGoal}ml goal.`,
        suggestion: 'Drink water consistently throughout the day. Aim for at least 500ml per meal.',
        icon: '💧',
      });
    }

    // --- SLEEP (future-ready) ---
    if (input.sleepHours && input.sleepHours < 6.5) {
      recommendations.push({
        category: 'recovery',
        priority: 1,
        message: `Sleep is low at ${input.sleepHours} hours.`,
        suggestion: 'Sleep is critical for muscle recovery and weight management. Aim for 7-9 hours.',
        icon: '😴',
      });
    }

    // Sort by priority (1 = highest)
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate weekly weight change from trend data
   */
  static calculateWeeklyWeightChange(weightTrend: { date: string; weight: number }[]): number {
    if (weightTrend.length < 2) return 0;
    const recent = weightTrend.slice(-7);
    const oldest = recent[0].weight;
    const newest = recent[recent.length - 1].weight;
    const days = recent.length;
    const dailyChange = (newest - oldest) / Math.max(1, days);
    return dailyChange * 7;
  }

  /**
   * Infer workout type from the workout name
   */
  static inferWorkoutType(name: string | undefined): 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'cardio' | 'hiit' | 'powerlifting' | 'bodybuilding' | 'full_body' | 'rest' {
    if (!name) return 'rest';
    const n = name.toLowerCase();
    if (n.includes('push')) return 'push';
    if (n.includes('pull')) return 'pull';
    if (n.includes('leg')) return 'legs';
    if (n.includes('upper')) return 'upper';
    if (n.includes('lower')) return 'lower';
    if (n.includes('cardio')) return 'cardio';
    if (n.includes('hiit') || n.includes('interval')) return 'hiit';
    if (n.includes('power')) return 'powerlifting';
    if (n.includes('bodybuild') || n.includes('hypertrophy')) return 'bodybuilding';
    if (n.includes('full')) return 'full_body';
    return 'bodybuilding';
  }

  /**
   * Generate a summary text of today's coaching
   */
  static getCoachSummary(input: CoachInput): string {
    const recommendations = this.generateCoaching(input);
    const proteinPercent = input.goals.protein > 0 ? Math.round((input.totals.protein / input.goals.protein) * 100) : 0;
    const caloriesPercent = input.goals.calories > 0 ? Math.round((input.totals.calories / input.goals.calories) * 100) : 0;

    const topRecommendation = recommendations[0];
    const summary = `Today: ${input.totals.calories} kcal (${caloriesPercent}%), Protein ${input.totals.protein}g (${proteinPercent}%)`;

    if (topRecommendation) {
      return `${summary}. ${topRecommendation.icon} ${topRecommendation.message}`;
    }
    return summary + '. On track. Keep it up!';
  }
}