import { useMemo, useState } from 'react';
import { FiInfo, FiSettings, FiTrendingUp } from 'react-icons/fi';
import { useMealContext } from '../context/MealContext';
import { NutritionService } from '../services/NutritionService';
import { calculateRequiredCalories } from '../../../shared/lib/calorieCalculator';
import { useSettings } from '../../settings/hooks/SettingsProvider';
import CalorieBreakdownDialog from './CalorieBreakdownDialog';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';

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

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Today's Nutrition
            </h3>
            {goalSource === 'calculated' && (
              <Badge variant="success" size="sm">
                <FiTrendingUp size={12} />
                Calculated
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBreakdownOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="View calorie calculation details"
            >
              <FiInfo size={16} />
            </button>
            <button
              onClick={handleSetGoal}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Set custom calorie goal"
            >
              <FiSettings size={16} />
            </button>
          </div>
        </div>

        {/* Calorie Progress */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totals.calories}
              </span>
              {expertMode && (
                <Badge variant="info" size="sm">Expert</Badge>
              )}
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              / {calorieGoal} kcal
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {remaining > 0
              ? `${remaining} kcal remaining`
              : 'Goal reached!'}
          </p>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Protein</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{totals.protein}g</p>
          </div>
          <div className="text-center p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Carbs</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{totals.carbs}g</p>
          </div>
          <div className="text-center p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Fat</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{totals.fat}g</p>
          </div>
        </div>

        {/* Meals Logged & Progress */}
        <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
          <span>{totals.mealsLogged} / 4 meals logged</span>
          {progress && (
            <span>Recorded: {new Date(progress.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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