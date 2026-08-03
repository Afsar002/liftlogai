import { useMemo, useState } from 'react';
import { FiInfo, FiSettings, FiTrendingUp } from 'react-icons/fi';
import { useMealContext } from '../context/MealContext';
import { NutritionService } from '../services/NutritionService';
import { calculateRequiredCalories } from '../../../shared/lib/calorieCalculator';
import { useSettings } from '../../settings/hooks/SettingsProvider';
import CalorieBreakdownDialog from './CalorieBreakdownDialog';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function CalorieRing({
  calories,
  percent,
}: {
  calories: number;
  percent: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="calorie-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="10"
          className="stroke-zinc-100 dark:stroke-white/8"
        />
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="url(#calorie-ring-grad)"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-zinc-900 dark:text-white">
          {calories}
        </span>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          kcal
        </span>
      </div>
    </div>
  );
}

export default function NutritionCard() {
  const { totals, calorieGoal, updateCalorieGoal, progress } = useMealContext();
  const { settings } = useSettings();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const expertMode = settings?.expertMode || false;

  const remaining = useMemo(
    () => NutritionService.calculateRemainingCalories(totals.calories, calorieGoal),
    [totals.calories, calorieGoal]
  );

  const progressPercent = useMemo(
    () => Math.min(100, Math.round((totals.calories / calorieGoal) * 100)),
    [totals.calories, calorieGoal]
  );

  const calculation = useMemo(() => {
    if (!settings) return null;
    return calculateRequiredCalories(settings);
  }, [settings]);

  const handleSetGoal = () => {
    const input = prompt('Enter daily calorie goal:', calorieGoal.toString());
    if (input) {
      const goal = parseInt(input, 10);
      if (!isNaN(goal) && goal > 0) {
        updateCalorieGoal(goal);
      }
    }
  };

  const goalSource = calculation ? 'calculated' : 'manual';

  const macros = [
    { label: 'Protein', value: totals.protein },
    { label: 'Carbs', value: totals.carbs },
    { label: 'Fat', value: totals.fat },
  ];

  return (
    <Card>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Today's Nutrition
            </h3>
            {goalSource === 'calculated' && (
              <Badge variant="success" size="sm">
                <FiTrendingUp size={12} />
                Calculated
              </Badge>
            )}
            {expertMode && (
              <Badge variant="info" size="sm">Expert</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBreakdownOpen(true)}
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/8 dark:hover:text-zinc-300"
              title="View calorie calculation details"
            >
              <FiInfo size={16} />
            </button>
            <button
              onClick={handleSetGoal}
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/8 dark:hover:text-zinc-300"
              aria-label="Set custom calorie goal"
              title="Set custom calorie goal"
            >
              <FiSettings size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <CalorieRing calories={totals.calories} percent={progressPercent} />

          <div className="w-full flex-1 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Daily goal
              </span>
              <span className="text-base font-bold tabular-nums text-zinc-900 dark:text-white">
                {calorieGoal.toLocaleString()} kcal
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {remaining > 0
                ? `${remaining.toLocaleString()} kcal remaining`
                : 'Goal reached! 🔥'}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {macros.map((macro) => (
                <div
                  key={macro.label}
                  className="rounded-2xl bg-zinc-50 px-2 py-2.5 text-center dark:bg-white/5"
                >
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {macro.label}
                  </p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-zinc-900 dark:text-white">
                    {macro.value}g
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-white/8 dark:text-zinc-400">
          <span>{totals.mealsLogged} / 4 meals logged</span>
          {progress && (
            <span>
              Recorded{' '}
              {new Date(progress.recordedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>

      <CalorieBreakdownDialog
        open={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        calculation={calculation}
        settings={settings}
      />
    </Card>
  );
}
