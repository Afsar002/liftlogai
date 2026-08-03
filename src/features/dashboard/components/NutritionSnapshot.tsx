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

interface MacroCardProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color: string;
  bgColor: string;
  delay: number;
  reduceMotion: boolean | null;
}

function MacroCard({ label, current, goal, unit, icon: Icon, color, bgColor, delay, reduceMotion }: MacroCardProps) {
  const percent = Math.min(current / goal, 1);
  const remaining = goal - current;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 25, delay }}
      className={cn(
        "relative rounded-xl p-4",
        "bg-zinc-50 dark:bg-white/5",
        "border border-zinc-200/60 dark:border-white/10",
        "transition-all duration-200",
        "hover:shadow-md dark:hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Icon and Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bgColor)}>
          <Icon size={16} className={cn(color, "dark:opacity-90")} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
          {label}
        </span>
      </div>

      {/* Values */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
            {current.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          / {goal.toLocaleString()} {unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-200/60 dark:bg-white/10">
        <motion.div
          className={cn("h-full rounded-full", color.replace("text-", "bg-"))}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${percent * 100}%` }}
          transition={{ type: "spring", stiffness: 280, damping: 25, delay: delay + 0.1, duration: 1 }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {Math.round(percent * 100)}%
        </span>
        <span className={cn(
          "text-xs font-medium",
          remaining < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
        )}>
          {remaining < 0 ? `${Math.abs(remaining).toLocaleString()} over` : `${remaining.toLocaleString()} left`}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Nutrition snapshot with clean dashboard layout.
 * Row 1: Full-width calories card with prominent progress bar
 * Row 2: Four equal metric cards (Protein, Carbs, Fat, Water)
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const caloriePercent = Math.min(data.calories.current / data.calories.goal, 1);
  const remainingCalories = data.calories.goal - data.calories.current;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
          <FiZap size={18} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
          Nutrition
        </h2>
      </div>

      {/* Row 1: Calories - Full Width */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 25, delay: 0.05 }}
        className="relative rounded-xl p-5 mb-4"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-950/20 dark:to-lime-950/20" />
        
        <div className="relative">
          {/* Calories Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                Calories
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {remainingCalories < 0 
                  ? `${Math.abs(remainingCalories).toLocaleString()} calories over goal`
                  : `${remainingCalories.toLocaleString()} calories remaining`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
                  {data.calories.current.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  / {data.calories.goal.toLocaleString()}
                </span>
              </div>
              <div className={cn(
                "text-sm font-bold mt-1",
                caloriePercent > 1 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              )}>
                {Math.round(caloriePercent * 100)}% complete
              </div>
            </div>
          </div>

          {/* Prominent Progress Bar */}
          <div className="relative h-4 overflow-hidden rounded-full bg-zinc-200/60 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-400"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${Math.min(caloriePercent * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 280, damping: 25, delay: 0.1, duration: 1.2 }}
            />
            {/* Over indicator */}
            {caloriePercent > 1 && (
              <div className="absolute inset-0 flex items-center justify-end pr-2">
                <span className="text-xs font-bold text-white drop-shadow-lg">OVER</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Row 2: Four Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MacroCard
          label="Protein"
          current={data.protein.current}
          goal={data.protein.goal}
          unit="g"
          icon={FiActivity}
          color="text-emerald-700"
          bgColor="bg-emerald-600/15"
          delay={0.15}
          reduceMotion={reduceMotion}
        />
        <MacroCard
          label="Carbs"
          current={data.carbs.current}
          goal={data.carbs.goal}
          unit="g"
          icon={FiTarget}
          color="text-blue-700"
          bgColor="bg-blue-600/15"
          delay={0.2}
          reduceMotion={reduceMotion}
        />
        <MacroCard
          label="Fat"
          current={data.fat.current}
          goal={data.fat.goal}
          unit="g"
          icon={FiHeart}
          color="text-amber-700"
          bgColor="bg-amber-600/15"
          delay={0.25}
          reduceMotion={reduceMotion}
        />
        <MacroCard
          label="Water"
          current={data.water.current}
          goal={data.water.goal}
          unit="ml"
          icon={FiDroplet}
          color="text-cyan-700"
          bgColor="bg-cyan-600/15"
          delay={0.3}
          reduceMotion={reduceMotion}
        />
      </div>
    </Card>
  );
}