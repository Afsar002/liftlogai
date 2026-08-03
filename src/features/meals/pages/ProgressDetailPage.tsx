import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCoffee, FiSun, FiMoon, FiBox, FiTarget, FiCheckCircle } from 'react-icons/fi';
import Layout from '../../../shared/components/layout/Layout';
import Card from '../../../shared/components/ui/Card';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { AnimatedPage } from '../../../shared/components/motion';
import { MealsRepository } from '../repository/MealsRepository';
import type { Meal, NutritionProgress } from '../types';

const MEAL_ICONS: Record<string, React.ReactNode> = {
  'Breakfast': <FiCoffee size={18} />,
  'Lunch': <FiSun size={18} />,
  'Dinner': <FiMoon size={18} />,
  'Snacks': <FiBox size={18} />,
};

export default function ProgressDetailPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [progress, setProgress] = useState<NutritionProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!date) return;

      setIsLoading(true);
      try {
        const [dayMeals, dayProgress] = await Promise.all([
          MealsRepository.getMealsForDate(date),
          MealsRepository.getProgressForDate(date),
        ]);
        setMeals(dayMeals);
        setProgress(dayProgress ?? null);
      } catch (err) {
        console.error('Error loading progress detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [date]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-44" />
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatedPage>
      <div className="space-y-7">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-5 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative">
            <button
              type="button"
              onClick={() => navigate('/meals/progress')}
              aria-label="Back to progress"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            >
              <FiArrowLeft size={14} aria-hidden="true" />
            </button>

            <span className="mt-4 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
              Nutrition day
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
              {formatDate(date || '')}
            </h1>

            {progress && (
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${
                    progress.caloriesConsumed <= progress.calorieGoal
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  <FiCheckCircle size={13} aria-hidden="true" />
                  {progress.caloriesConsumed <= progress.calorieGoal ? 'On track' : 'Over goal'}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Summary Card */}
        {progress && (
          <Card padding="lg">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FiTarget size={20} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                    Daily Summary
                  </h3>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    progress.caloriesConsumed <= progress.calorieGoal
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <FiCheckCircle size={13} aria-hidden="true" />
                  {progress.caloriesConsumed <= progress.calorieGoal ? 'On Track' : 'Over Goal'}
                </span>
              </div>

              {/* Calories progress */}
              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Calories
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
                    {progress.caloriesConsumed.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      / {progress.calorieGoal.toLocaleString()} kcal
                    </span>
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      progress.caloriesConsumed <= progress.calorieGoal
                        ? 'bg-gradient-to-r from-emerald-500 to-lime-400'
                        : 'bg-orange-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((progress.caloriesConsumed / progress.calorieGoal) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Protein</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
                    {progress.protein}
                    <span className="ml-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">g</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Carbs</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
                    {progress.carbs}
                    <span className="ml-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">g</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Fat</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
                    {progress.fat}
                    <span className="ml-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">g</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Meals List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Meals Logged
          </h2>

          {meals.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/8">
                <FiCoffee size={22} aria-hidden="true" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No meals logged for this day</p>
            </div>
          ) : (
            meals.map((meal) => (
              <Card key={meal.id} padding="none" className="overflow-hidden">
                {/* Meal Header */}
                <div className="flex items-center gap-2.5 border-b border-zinc-100 bg-zinc-50 px-5 py-3.5 dark:border-white/6 dark:bg-white/5">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {MEAL_ICONS[meal.mealType] || <FiCoffee size={18} />}
                  </span>
                  <h3 className="flex-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {meal.mealType}
                  </h3>
                  <span className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                    {meal.items.length} {meal.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Meal Items */}
                {meal.items.length === 0 ? (
                  <p className="px-5 py-4 text-xs italic text-zinc-400 dark:text-zinc-500">
                    No items in this meal
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-white/6">
                    {meal.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {item.quantity} {item.servingUnit}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
                            {item.calories} kcal
                          </span>
                          <span className="text-[11px] text-red-500/70">P{item.protein}</span>
                          <span className="text-[11px] text-blue-500/70">C{item.carbs}</span>
                          <span className="text-[11px] text-yellow-500/70">F{item.fat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
      </AnimatedPage>
    </Layout>
  );
}
