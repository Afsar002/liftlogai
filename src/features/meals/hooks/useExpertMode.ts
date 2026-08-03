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
import type { MealItem } from '../types';
import { allFoods } from '../data/foodDatabase';
import { NutritionEngine } from '../services/NutritionEngine';
import { AICoachService } from '../services/AICoachService';
import { MealsRepository } from '../repository/MealsRepository';
import { v4 as uuidv4 } from 'uuid';
import { mealEvents } from '../../../shared/lib/mealEvents';

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

  // Load expert logs from regular meal system on initialization
  useEffect(() => {
    const loadFromMeals = async () => {
      try {
        const meals = await MealsRepository.getTodayMeals();
        const logs: RawFoodLog[] = [];

        for (const meal of meals) {
          for (const item of meal.items) {
            // Convert meal item to raw food log format
            const log: RawFoodLog = {
              id: item.id,
              foodId: item.foodId,
              foodName: item.name,
              category: 'protein' as any, // Default category, could be enhanced
              rawWeight: item.quantity,
              logMode: 'raw',
              cookedWeight: item.quantity,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
              fiber: 0,
              timestamp: new Date().toISOString(),
              mealId: meal.mealType.toLowerCase(),
            };
            logs.push(log);
          }
        }

        if (logs.length > 0) {
          setRawFoodLogs(logs);
        }
      } catch (err) {
        console.error('Failed to load expert logs from meals:', err);
      }
    };

    loadFromMeals();
  }, []);

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
    async (food: RawFoodEntry, weightGrams: number, mode: LogMode, mealId: string) => {
      const nutrition = NutritionEngine.calculateNutritionPreview(food, weightGrams, mode);
      const rawWeight = mode === 'cooked'
        ? Math.round((weightGrams / food.cookedConversionFactor) * 10) / 10
        : weightGrams;
      const cookedWeight = mode === 'cooked'
        ? weightGrams
        : Math.round(weightGrams * food.cookedConversionFactor * 10) / 10;

      // Generate a single UUID to use for both the raw food log and the meal item
      // This ensures removeRawFoodLog can find the meal item by the same logId
      const logId = uuidv4();

      const log: RawFoodLog = {
        id: logId,
        foodId: food.id,
        foodName: food.name,
        category: food.category,
        rawWeight: rawWeight,
        logMode: mode,
        cookedWeight: cookedWeight,
        ...nutrition,
        timestamp: new Date().toISOString(),
        mealId,
      };
      setRawFoodLogs(prev => [...prev, log]);
      setRecentFoods(prev => {
        const updated = [food.id, ...prev.filter(f => f !== food.id)];
        return updated.slice(0, 20);
      });

      // Also persist to regular meal system so it shows on Home Dashboard and survives refresh
      try {
        const today = MealsRepository.getTodayDate();
        // Map expert mealId to standard mealType
        const mealTypeMap: Record<string, 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'> = {
          'breakfast': 'Breakfast',
          'lunch': 'Lunch',
          'dinner': 'Dinner',
          'snacks': 'Snacks',
          'default': 'Snacks'
        };
        const mealType = mealTypeMap[mealId] || 'Snacks';

        // Get or create the meal for today
        const meal = await MealsRepository.getOrCreateMealForType(mealType);

        // Create meal item from the logged food using the SAME ID as the log
        // IMPORTANT: Store nutrition PER 100g (food.nutritionPer100g) not for the full weight.
        // The meal system calculates totals as: item.protein * (quantity / servingSize)
        // So if we store full-weight nutrition with servingSize=100, it double-counts.
        const per100g = food.nutritionPer100g;
        const mealItem: MealItem = {
          id: logId,
          mealId: meal.id,
          foodId: food.id,
          name: food.name,
          quantity: weightGrams,
          servingSize: 100,
          servingUnit: 'g',
          calories: per100g.calories,
          protein: per100g.protein,
          carbs: per100g.carbs,
          fat: per100g.fat,
        };

        await MealsRepository.addFoodToMeal(meal.id, mealItem);

        // Emit event to notify other consumers (e.g., Home Dashboard)
        mealEvents.emit('meal:added', { mealId: meal.id, item: mealItem });
      } catch (err) {
        console.error('Failed to sync expert food log to regular meals:', err);
      }
    },
    []
  );

  // Remove a raw food log
  const removeRawFoodLog = useCallback(async (logId: string) => {
    // Find the log to get the mealId for DB cleanup BEFORE updating state
    let mealId: string | null = null;
    // We need to read current state - use a synchronous approach
    // The log is still in rawFoodLogs at this point since we haven't updated state yet
    // We'll use a ref or get it from the closure
    // For now, use a simple approach: find in current state
    // This works because React batches state updates but the current render still has old state
    // Actually, better to find it first synchronously
    // We can't easily access current state in useCallback without a ref
    // Let's use a different approach: capture mealId from the log before filtering

    // First pass: find the mealId from the current logs
    // Since we're in a useCallback, we need to access the current value
    // We'll do the DB cleanup first by reading from DB, then update state
    try {
      const today = MealsRepository.getTodayDate();
      const meals = await MealsRepository.getMealsForDate(today);
      // Find the meal item by ID across all meals
      let foundItemId: string | null = null;
      let foundMealId: string | null = null;
      for (const meal of meals) {
        const item = meal.items.find(i => i.id === logId);
        if (item) {
          foundItemId = item.id;
          foundMealId = meal.id;
          break;
        }
      }
      if (foundItemId) {
        await MealsRepository.removeMealItem(foundItemId);

        // Emit event to notify other consumers
        mealEvents.emit('meal:removed', { mealId: foundMealId, itemId: foundItemId });
      }
    } catch (err) {
      console.error('Failed to sync expert food removal to regular meals:', err);
    }

    // Now update local state
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
          const nutrition = NutritionEngine.calculateNutritionPreview(entry.food, entry.rawWeight, 'raw');
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
      const nutrition = NutritionEngine.calculateNutritionPreview(e.food, e.rawWeight, 'raw');
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
  // Build a full FoodNutrition totals object from the expert totals plus the
  // micronutrients summed from rawFoodLogs so that zinc, vitaminB6 and
  // vitaminB12 (and all other micronutrients) are carried into the coach.
  const buildCoachTotals = () => {
    const sum = (key: keyof RawFoodLog) =>
      rawFoodLogs.reduce((acc, log) => acc + ((log[key] as number | undefined) ?? 0), 0);
    return {
      calories: expertTotals.calories,
      protein: expertTotals.protein,
      carbs: expertTotals.carbs,
      fat: expertTotals.fat,
      fiber: expertTotals.fiber,
      sugar: expertTotals.sugar,
      sodium: expertTotals.sodium,
      cholesterol: expertTotals.cholesterol,
      potassium: sum('potassium'),
      calcium: sum('calcium'),
      magnesium: sum('magnesium'),
      iron: sum('iron'),
      zinc: sum('zinc'),
      vitaminA: sum('vitaminA'),
      vitaminB6: sum('vitaminB6'),
      vitaminB12: sum('vitaminB12'),
      vitaminC: sum('vitaminC'),
      vitaminD: sum('vitaminD'),
      vitaminE: sum('vitaminE'),
      vitaminK: sum('vitaminK'),
    };
  };

  const aiCoachRecommendations = useMemo(() => {
    const totals = buildCoachTotals();
    return AICoachService.generateCoaching({
      totals,
      goals: { calories: goals.calories, protein: goals.protein, carbs: goals.carbs, fat: goals.fat, fiber: goals.fiber, sugar: goals.sugar, sodium: goals.sodium, cholesterol: goals.cholesterol, water: goals.water },
      workouts: [], weightTrend: [], waterIntake, currentWeight: 70, trainingToday: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertTotals, goals, waterIntake, rawFoodLogs]);

  const aiCoachSummary = useMemo(() => {
    const totals = buildCoachTotals();
    return AICoachService.getCoachSummary({
      totals,
      goals: { calories: goals.calories, protein: goals.protein, carbs: goals.carbs, fat: goals.fat, fiber: goals.fiber, sugar: goals.sugar, sodium: goals.sodium, cholesterol: goals.cholesterol, water: goals.water },
      workouts: [], weightTrend: [], waterIntake, currentWeight: 70, trainingToday: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertTotals, goals, waterIntake, rawFoodLogs]);

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