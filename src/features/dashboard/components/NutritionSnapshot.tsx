import { useEffect, useState } from "react";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiZap,
  FiDroplet,
  FiActivity,
  FiTarget,
  FiHeart,
} from "react-icons/fi";

interface MacroData {
  calories: { current: number; goal: number };
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  fat: { current: number; goal: number };
  water: { current: number; goal: number };
}

/**
 * Nutrition snapshot with macro rings, calorie budget bar, and water tracking.
 * Apple Health-style dashboard for quick nutrition overview.
 */
export default function NutritionSnapshot() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<MacroData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { MealsRepository } = await import("../../meals/repository/MealsRepository");
    const { SettingsRepository } = await import("../../settings/repository/SettingsRepository");

    const [meals, settings] = await Promise.all([
      MealsRepository.getTodayMeals(),
      SettingsRepository.getSettings(),
    ]);

    // Calculate totals from meal items
    const totals = meals.reduce(
      (acc, meal) => {
        meal.items.forEach((item) => {
          acc.calories += item.calories;
          acc.protein += item.protein;
          acc.carbs += item.carbs;
          acc.fat += item.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Calculate calorie goal from user settings (Mifflin-St Jeor)
    let calorieGoal = 2000;
    if (settings) {
      const weight = settings.weight;
      const height = settings.height;
      const age = settings.age;
      const gender = settings.gender;
      const activityLevel = settings.activityLevel;
      const goal = settings.goal;

      let bmr = 0;
      if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

      if (goal === "lose") calorieGoal = Math.round(tdee - 500);
      else if (goal === "gain") calorieGoal = Math.round(tdee + 500);
      else calorieGoal = Math.round(tdee);
    }

    const goals = {
      calories: calorieGoal,
      protein: Math.round(calorieGoal * 0.3 / 4), // 30% protein
      carbs: Math.round(calorieGoal * 0.4 / 4),  // 40% carbs
      fat: Math.round(calorieGoal * 0.3 / 9),    // 30% fat
      water: 3000,
    };

    // Water intake not tracked in meals currently - use default
    const water = 0;

    setData({
      calories: { current: totals.calories, goal: goals.calories },
      protein: { current: totals.protein, goal: goals.protein },
      carbs: { current: totals.carbs, goal: goals.carbs },
      fat: { current: totals.fat, goal: goals.fat },
      water: { current: water, goal: goals.water },
    });
  }

  if (!data) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              <FiZap size={18} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              Nutrition
            </h2>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const macros = [
    { key: "protein", label: "Protein", unit: "g", color: "text-emerald-700", bg: "bg-emerald-600/15", icon: FiActivity },
    { key: "carbs", label: "Carbs", unit: "g", color: "text-blue-700", bg: "bg-blue-600/15", icon: FiTarget },
    { key: "fat", label: "Fat", unit: "g", color: "text-amber-700", bg: "bg-amber-600/15", icon: FiHeart },
  ];

  const caloriePercent = Math.min(data.calories.current / data.calories.goal, 1);
  const waterPercent = Math.min(data.water.current / data.water.goal, 1);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            <FiZap size={18} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
            Nutrition
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Calorie budget bar - full width on mobile, 2-col on lg */}
        <motion.div
          className="lg:col-span-2"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Calories
            </span>
            <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {data.calories.current.toLocaleString()} / {data.calories.goal.toLocaleString()}
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/12">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-400"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${caloriePercent * 100}%` }}
              transition={{ type: "spring", stiffness: 280, damping: 25, duration: 1.2 }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{Math.round(caloriePercent * 100)}% of goal</span>
            <span className={cn(
              "font-semibold",
              caloriePercent > 1 ? "text-red-500" : caloriePercent > 0.9 ? "text-amber-500" : "text-emerald-600"
            )}>
              {caloriePercent > 1
                ? `${(data.calories.current - data.calories.goal).toLocaleString()} over`
                : `${(data.calories.goal - data.calories.current).toLocaleString()} remaining`}
            </span>
          </div>
        </motion.div>

        {/* Water ring */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-200/80 dark:text-white/15"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#waterGradient)"
                strokeWidth="8"
                strokeDasharray={283}
                strokeDashoffset={reduceMotion ? 283 * (1 - waterPercent) : 283}
                strokeLinecap="round"
                className="text-cyan-600 dark:text-cyan-400"
                animate={{ strokeDashoffset: 283 * (1 - waterPercent) }}
                transition={{ type: "spring", stiffness: 280, damping: 25, delay: 0.2, duration: 1.2 }}
              />
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <FiDroplet size={20} className="text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
              <span className="text-xs font-bold text-zinc-950 dark:text-white">
                {Math.round(waterPercent * 100)}%
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">Water</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {data.water.current} / {data.water.goal} ml
          </p>
        </motion.div>

        {/* Macros grid - each as a mini card */}
        {macros.map((macro, index) => {
          const current = data[macro.key as keyof typeof data].current as number;
          const goal = data[macro.key as keyof typeof data].goal as number;
          const percent = Math.min(current / goal, 1);

          return (
            <motion.div
              key={macro.key}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className={cn(
                "relative rounded-xl p-3",
                macro.bg,
                "dark:bg-opacity-10"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <macro.icon size={16} className={cn(macro.color, "dark:opacity-90")} aria-hidden="true" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {macro.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold tabular-nums text-zinc-900 dark:text-white">
                  {current}{macro.unit}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  /{goal}{macro.unit}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200/50 dark:bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: macro.color.replace("text-", "") }}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${percent * 100}%` }}
                  transition={{ type: "spring", stiffness: 280, damping: 25, delay: 0.3, duration: 1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}