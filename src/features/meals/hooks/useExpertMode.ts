import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  ExpertNutritionTotals,
  RawFoodEntry,
  RawFoodLog,
  LogMode,
  CompetitionPrepInputs,
  CompetitionPrepResults,
  MealBuilderEntry,
  MealBuilderMeal,
  MicronutrientEntry,
  AIInsight,
  MealQualityScore,
  NutritionTimelinePoint,
  GoalTrackingData,
  PeakWeekDay,
} from '../types/expert';
import { allFoods, calculateNutrition, convertRawToCooked } from '../data/foodDatabase';
import { AICoachService } from '../services/AICoachService';
import { v4 as uuidv4 } from 'uuid';

const GOALS_STORAGE_KEY = 'liftlog_expert_goals';

const DEFAULT_GOALS = {
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

export function useExpertMode() {
  const [goals, setGoals] = useState<typeof DEFAULT_GOALS>(() => {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });
  const [rawFoodLogs, setRawFoodLogs] = useState<RawFoodLog[]>([]);
  const [logMode, setLogMode] = useState<LogMode>('raw');
  const [waterIntake, setWaterIntake] = useState(0);
  const [mealBuilderMeals, setMealBuilderMeals] = useState<MealBuilderMeal[]>([]);
  const [timelineData, setTimelineData] = useState<NutritionTimelinePoint[]>([]);
  const [peakWeekData, setPeakWeekData] = useState<PeakWeekDay[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>([]);
  const [recentFoods, setRecentFoods] = useState<string[]>([]);

  // Calculate expert nutrition totals from raw food logs
  const expertTotals = useMemo<ExpertNutritionTotals>(() => {
    const totals = rawFoodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
        fiber: acc.fiber + log.fiber,
        sugar: acc.sugar + (log.sugar ?? log.carbs * 0.3),
        sodium: acc.sodium + (log.sodium ?? 0),
        cholesterol: acc.cholesterol + (log.cholesterol ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 }
    );

    const calcPercentage = (current: number, goal: number) =>
      goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

    return {
      calories: totals.calories,
      caloriesGoal: goals.calories,
      caloriesRemaining: Math.max(0, goals.calories - totals.calories),
      caloriesPercentage: calcPercentage(totals.calories, goals.calories),
      protein: totals.protein,
      proteinGoal: goals.protein,
      proteinRemaining: Math.max(0, goals.protein - totals.protein),
      proteinPercentage: calcPercentage(totals.protein, goals.protein),
      carbs: totals.carbs,
      carbsGoal: goals.carbs,
      carbsRemaining: Math.max(0, goals.carbs - totals.carbs),
      carbsPercentage: calcPercentage(totals.carbs, goals.carbs),
      fat: totals.fat,
      fatGoal: goals.fat,
      fatRemaining: Math.max(0, goals.fat - totals.fat),
      fatPercentage: calcPercentage(totals.fat, goals.fat),
      fiber: totals.fiber,
      fiberGoal: goals.fiber,
      fiberRemaining: Math.max(0, goals.fiber - totals.fiber),
      fiberPercentage: calcPercentage(totals.fiber, goals.fiber),
      sugar: totals.sugar,
      sugarGoal: goals.sugar,
      sugarRemaining: Math.max(0, goals.sugar - totals.sugar),
      sugarPercentage: calcPercentage(totals.sugar, goals.sugar),
      sodium: totals.sodium,
      sodiumGoal: goals.sodium,
      sodiumRemaining: Math.max(0, goals.sodium - totals.sodium),
      sodiumPercentage: calcPercentage(totals.sodium, goals.sodium),
      cholesterol: totals.cholesterol,
      cholesterolGoal: goals.cholesterol,
      cholesterolRemaining: Math.max(0, goals.cholesterol - totals.cholesterol),
      cholesterolPercentage: calcPercentage(totals.cholesterol, goals.cholesterol),
      water: waterIntake,
      waterGoal: goals.water,
      waterRemaining: Math.max(0, goals.water - waterIntake),
      waterPercentage: calcPercentage(waterIntake, goals.water),
    };
  }, [rawFoodLogs, goals, waterIntake]);

  // Log a raw food
  const logRawFood = useCallback(
    (food: RawFoodEntry, weightGrams: number, mode: LogMode, mealId: string) => {
      const actualWeight = mode === 'cooked'
        ? weightGrams / food.cookedConversionFactor
        : weightGrams;
      const nutrition = calculateNutrition(food, actualWeight);
      const log: RawFoodLog = {
        id: uuidv4(),
        foodId: food.id,
        foodName: food.name,
        category: food.category,
        rawWeight: Math.round(actualWeight * 10) / 10,
        logMode: mode,
        cookedWeight: mode === 'cooked' ? weightGrams : convertRawToCooked(actualWeight, food.cookedConversionFactor),
        ...nutrition,
        timestamp: new Date().toISOString(),
        mealId,
      };
      setRawFoodLogs(prev => [...prev, log]);
      setRecentFoods(prev => {
        const updated = [food.id, ...prev.filter(f => f !== food.id)];
        return updated.slice(0, 20);
      });
    },
    []
  );

  // Remove a raw food log
  const removeRawFoodLog = useCallback((logId: string) => {
    setRawFoodLogs(prev => prev.filter(l => l.id !== logId));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((foodId: string) => {
    setFavoriteFoods(prev =>
      prev.includes(foodId)
        ? prev.filter(f => f !== foodId)
        : [...prev, foodId]
    );
  }, []);

  // Competition Prep Calculator
  const calculateCompetitionPrep = useCallback(
    (inputs: CompetitionPrepInputs): CompetitionPrepResults => {
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      const bmr = 370 + (21.6 * (inputs.currentWeight * (1 - inputs.bodyFatPercentage / 100)));
      const maintenance = Math.round(bmr * activityMultipliers[inputs.dailyActivity]);
      const deficit = Math.round(inputs.targetWeeklyLoss * 1100);
      const contestCalories = Math.max(1200, maintenance - deficit);
      const expectedWeeklyFatLoss = deficit / 1100;
      const projectedStageWeight = inputs.currentWeight - (expectedWeeklyFatLoss * inputs.weeksUntilShow);

      return {
        maintenanceCalories: maintenance,
        contestCalories,
        dailyDeficit: deficit,
        expectedWeeklyFatLoss: Math.round(expectedWeeklyFatLoss * 10) / 10,
        projectedStageWeight: Math.round(projectedStageWeight * 10) / 10,
        proteinRecommendation: Math.round(inputs.currentWeight * 2.3),
        carbRecommendation: Math.round(contestCalories * 0.35 / 4),
        fatRecommendation: Math.round(contestCalories * 0.25 / 9),
        waterRecommendation: Math.round(inputs.currentWeight * 35),
        sodiumRecommendation: 1500,
        fiberRecommendation: Math.round(inputs.currentWeight * 0.4),
      };
    },
    []
  );

  // Meal Builder
  const createMealBuilderMeal = useCallback(
    (name: string, entries: MealBuilderEntry[]): MealBuilderMeal => {
      const totals = entries.reduce(
        (acc, entry) => {
          const nutrition = calculateNutrition(entry.food, entry.rawWeight);
          return {
            calories: acc.calories + nutrition.calories,
            protein: acc.protein + nutrition.protein,
            carbs: acc.carbs + nutrition.carbs,
            fat: acc.fat + nutrition.fat,
            fiber: acc.fiber + nutrition.fiber,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      const score = calculateMealScore(entries);

      const meal: MealBuilderMeal = {
        id: uuidv4(),
        name,
        entries,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber,
        score,
      };

      setMealBuilderMeals(prev => [...prev, meal]);
      return meal;
    },
    []
  );

  // Meal Quality Score
  const calculateMealScore = useCallback((entries: MealBuilderEntry[]): number => {
    if (entries.length === 0) return 0;

    const hasProtein = entries.some(e => e.food.category === 'protein');
    const hasVeggies = entries.some(e => e.food.category === 'vegetables');
    const hasFruit = entries.some(e => e.food.category === 'fruit');
    const hasHealthyFats = entries.some(e => e.food.category === 'fats');
    const hasCarbs = entries.some(e => e.food.category === 'carbs');

    let score = 0;
    if (hasProtein) score += 25;
    if (hasVeggies) score += 20;
    if (hasFruit) score += 15;
    if (hasHealthyFats) score += 20;
    if (hasCarbs) score += 20;

    const totalFiber = entries.reduce((sum, e) => {
      const nutrition = calculateNutrition(e.food, e.rawWeight);
      return sum + nutrition.fiber;
    }, 0);
    if (totalFiber > 5) score += 10;

    return Math.min(100, score);
  }, []);

  // AI Insights
  const aiInsights = useMemo<AIInsight[]>(() => {
    const insights: AIInsight[] = [];
    const t = expertTotals;

    if (t.proteinRemaining > 20) {
      insights.push({
        type: 'warning',
        message: `Protein is ${Math.round(t.proteinRemaining)}g below target. Consider adding a protein source.`,
        icon: '🥩',
      });
    }
    if (t.carbsPercentage >= 80 && t.carbsPercentage <= 100) {
      insights.push({
        type: 'success',
        message: 'Carbohydrates are ideal for training performance.',
        icon: '✅',
      });
    }
    if (t.fiberRemaining > 10) {
      insights.push({
        type: 'warning',
        message: `Fiber intake is low. Add vegetables or oats to reach ${Math.round(t.fiberGoal)}g.`,
        icon: '🥦',
      });
    }
    if (t.sodiumPercentage > 80) {
      insights.push({
        type: 'warning',
        message: 'Sodium is approaching target. Monitor intake.',
        icon: '🧂',
      });
    }
    if (t.waterPercentage < 50) {
      insights.push({
        type: 'warning',
        message: `Water intake is low. Aim for ${Math.round(t.waterGoal / 1000)}L daily.`,
        icon: '💧',
      });
    }
    if (t.proteinPercentage >= 90) {
      insights.push({
        type: 'success',
        message: 'Great protein intake for muscle recovery!',
        icon: '💪',
      });
    }
    if (t.caloriesPercentage < 50) {
      insights.push({
        type: 'info',
        message: 'Meal timing could improve recovery. Consider spreading meals evenly.',
        icon: '⏰',
      });
    }

    return insights;
  }, [expertTotals]);

  // Micronutrients
  const micronutrients = useMemo<MicronutrientEntry[]>(() => {
    const sum = (key: keyof RawFoodLog) =>
      rawFoodLogs.reduce((acc, log) => acc + ((log[key] as number | undefined) ?? 0), 0);

    const entries: { name: string; value: number; target: number; unit: string }[] = [
      { name: 'Vitamin A', value: sum('vitaminA'), target: 900, unit: 'mcg' },
      { name: 'Vitamin B6', value: sum('vitaminB6'), target: 1.3, unit: 'mg' },
      { name: 'Vitamin B12', value: sum('vitaminB12'), target: 2.4, unit: 'mcg' },
      { name: 'Vitamin C', value: sum('vitaminC'), target: 90, unit: 'mg' },
      { name: 'Vitamin D', value: sum('vitaminD'), target: 15, unit: 'mcg' },
      { name: 'Vitamin E', value: sum('vitaminE'), target: 15, unit: 'mg' },
      { name: 'Vitamin K', value: sum('vitaminK'), target: 120, unit: 'mcg' },
      { name: 'Calcium', value: sum('calcium'), target: 1000, unit: 'mg' },
      { name: 'Iron', value: sum('iron'), target: 8, unit: 'mg' },
      { name: 'Magnesium', value: sum('magnesium'), target: 420, unit: 'mg' },
      { name: 'Potassium', value: sum('potassium'), target: 4700, unit: 'mg' },
      { name: 'Zinc', value: sum('zinc'), target: 11, unit: 'mg' },
    ];

    return entries.map((e) => ({
      name: e.name,
      current: Math.round(e.value * 100) / 100,
      target: e.target,
      remaining: Math.max(0, Math.round((e.target - e.value) * 100) / 100),
      unit: e.unit,
    }));
  }, [rawFoodLogs]);

  // Goal Tracking
  const goalTracking = useMemo<GoalTrackingData>(() => {
    const maintenance = goals.calories;
    const deficit = 500;
    const surplus = 300;
    return {
      maintenanceCalories: maintenance,
      cutCalories: maintenance - deficit,
      bulkCalories: maintenance + surplus,
      deficit,
      surplus,
      expectedWeeklyChange: deficit / 1100,
      projectedGoalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
  }, [goals.calories]);

  // Macro split
  const macroSplit = useMemo(() => {
    const totalCal = expertTotals.calories || 1;
    return {
      proteinPercent: Math.round((expertTotals.protein * 4 / totalCal) * 100),
      carbsPercent: Math.round((expertTotals.carbs * 4 / totalCal) * 100),
      fatPercent: Math.round((expertTotals.fat * 9 / totalCal) * 100),
      proteinPerKg: 0, // would need body weight
      caloriesPerKg: 0, // would need body weight
    };
  }, [expertTotals]);

  // AI Coach
  const aiCoachRecommendations = useMemo(() => {
    const totals = {
      calories: expertTotals.calories,
      protein: expertTotals.protein,
      carbs: expertTotals.carbs,
      fat: expertTotals.fat,
      fiber: expertTotals.fiber,
      sugar: expertTotals.sugar,
      sodium: expertTotals.sodium,
      cholesterol: expertTotals.cholesterol,
      potassium: 0, calcium: 0, magnesium: 0, iron: 0,
      vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
    };
    return AICoachService.generateCoaching({
      totals,
      goals: { calories: goals.calories, protein: goals.protein, carbs: goals.carbs, fat: goals.fat, fiber: goals.fiber, sugar: goals.sugar, sodium: goals.sodium, cholesterol: goals.cholesterol, water: goals.water },
      workouts: [], weightTrend: [], waterIntake, currentWeight: 70, trainingToday: false,
    });
  }, [expertTotals, goals, waterIntake]);

  const aiCoachSummary = useMemo(() => {
    const totals = {
      calories: expertTotals.calories,
      protein: expertTotals.protein,
      carbs: expertTotals.carbs,
      fat: expertTotals.fat,
      fiber: expertTotals.fiber,
      sugar: expertTotals.sugar,
      sodium: expertTotals.sodium,
      cholesterol: expertTotals.cholesterol,
      potassium: 0, calcium: 0, magnesium: 0, iron: 0,
      vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
    };
    return AICoachService.getCoachSummary({
      totals,
      goals: { calories: goals.calories, protein: goals.protein, carbs: goals.carbs, fat: goals.fat, fiber: goals.fiber, sugar: goals.sugar, sodium: goals.sodium, cholesterol: goals.cholesterol, water: goals.water },
      workouts: [], weightTrend: [], waterIntake, currentWeight: 70, trainingToday: false,
    });
  }, [expertTotals, goals, waterIntake]);

  // Water tracking
  // Persist goals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  }, [goals]);

  const addWater = useCallback((amount: number) => {
    setWaterIntake(prev => prev + amount);
  }, []);

  const resetWater = useCallback(() => {
    setWaterIntake(0);
  }, []);

  return {
    // State
    goals,
    rawFoodLogs,
    logMode,
    waterIntake,
    mealBuilderMeals,
    timelineData,
    peakWeekData,
    favoriteFoods,
    recentFoods,
    // Computed
    expertTotals,
    aiInsights,
    micronutrients,
    goalTracking,
    macroSplit,
    aiCoachRecommendations,
    aiCoachSummary,
    // Actions
    setGoals,
    setLogMode,
    logRawFood,
    removeRawFoodLog,
    toggleFavorite,
    calculateCompetitionPrep,
    createMealBuilderMeal,
    addWater,
    resetWater,
    setPeakWeekData,
    setTimelineData,
  };
}