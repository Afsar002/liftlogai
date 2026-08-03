import Card from "../../../../shared/components/ui/Card";
import Badge from "../../../../shared/components/ui/Badge";
import type { ExpertNutritionTotals } from "../../types/expert";

interface Props {
  totals: ExpertNutritionTotals;
}

function NutritionMetricCard({
  label,
  current,
  goal,
  remaining,
  percentage,
  unit,
  color,
  icon,
}: {
  label: string;
  current: number;
  goal: number;
  remaining: number;
  percentage: number;
  unit: string;
  color: string;
  icon: string;
}) {
  const barColor = percentage >= 100 ? 'bg-emerald-500' : percentage >= 80 ? 'bg-lime-500' : 'bg-zinc-400 dark:bg-zinc-500';

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {label}
            </span>
          </div>
          <Badge variant={percentage >= 100 ? 'success' : percentage >= 80 ? 'warning' : 'default'} size="sm">
            {percentage}%
          </Badge>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {current.toLocaleString()}
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-1">{unit}</span>
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            / {goal.toLocaleString()}
          </span>
        </div>

        <div className="w-full h-2 bg-zinc-200 dark:bg-white/8 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {remaining > 0 ? `${remaining.toLocaleString()} ${unit} remaining` : 'Goal reached!'}
        </p>
      </div>
    </Card>
  );
}

export default function ExpertNutritionDashboard({ totals }: Props) {
  const metrics = [
    { label: 'Calories', current: totals.calories, goal: totals.caloriesGoal, remaining: totals.caloriesRemaining, percentage: totals.caloriesPercentage, unit: 'kcal', color: 'green', icon: '🔥' },
    { label: 'Protein', current: totals.protein, goal: totals.proteinGoal, remaining: totals.proteinRemaining, percentage: totals.proteinPercentage, unit: 'g', color: 'red', icon: '🥩' },
    { label: 'Carbs', current: totals.carbs, goal: totals.carbsGoal, remaining: totals.carbsRemaining, percentage: totals.carbsPercentage, unit: 'g', color: 'blue', icon: '🌾' },
    { label: 'Fat', current: totals.fat, goal: totals.fatGoal, remaining: totals.fatRemaining, percentage: totals.fatPercentage, unit: 'g', color: 'yellow', icon: '🥑' },
    { label: 'Fiber', current: totals.fiber, goal: totals.fiberGoal, remaining: totals.fiberRemaining, percentage: totals.fiberPercentage, unit: 'g', color: 'green', icon: '🥦' },
    { label: 'Sugar', current: totals.sugar, goal: totals.sugarGoal, remaining: totals.sugarRemaining, percentage: totals.sugarPercentage, unit: 'g', color: 'red', icon: '🍬' },
    { label: 'Sodium', current: totals.sodium, goal: totals.sodiumGoal, remaining: totals.sodiumRemaining, percentage: totals.sodiumPercentage, unit: 'mg', color: 'blue', icon: '🧂' },
    { label: 'Cholesterol', current: totals.cholesterol, goal: totals.cholesterolGoal, remaining: totals.cholesterolRemaining, percentage: totals.cholesterolPercentage, unit: 'mg', color: 'yellow', icon: '🥚' },
    { label: 'Water', current: totals.water, goal: totals.waterGoal, remaining: totals.waterRemaining, percentage: totals.waterPercentage, unit: 'ml', color: 'blue', icon: '💧' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Expert Nutrition Dashboard</h2>
        <Badge variant="info" size="sm">Expert Mode</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <NutritionMetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  );
}