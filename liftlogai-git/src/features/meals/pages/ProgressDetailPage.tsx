import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCoffee, FiSun, FiMoon, FiBox } from 'react-icons/fi';
import Layout from '../../../shared/components/layout/Layout';
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
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-zinc-400 text-lg">Loading details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Progress Details</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatDate(date || '')}</p>
          </div>
        </div>

        {/* Summary Card */}
        {progress && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiCalendar size={20} className="text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Daily Summary</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Calories</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                  {progress.caloriesConsumed} / {progress.calorieGoal} kcal
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Protein</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{progress.protein}g</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Carbs</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{progress.carbs}g</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Fat</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{progress.fat}g</p>
              </div>
            </div>
          </div>
        )}

        {/* Meals List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Meals Logged</h2>
          
          {meals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No meals logged for this day</p>
            </div>
          ) : (
            meals.map((meal) => (
              <div
                key={meal.id}
                className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
              >
                {/* Meal Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="text-green-600 dark:text-green-400">
                    {MEAL_ICONS[meal.mealType] || <FiCoffee size={18} />}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex-1">
                    {meal.mealType}
                  </h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {meal.items.length} {meal.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Meal Items */}
                {meal.items.length === 0 ? (
                  <div className="px-4 py-3">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">No items in this meal</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {meal.items.map((item) => (
                      <div key={item.id} className="px-4 py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {item.quantity} {item.servingUnit}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {Math.round((item.calories * item.quantity) / item.servingSize)} kcal
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              P{item.protein}g · C{item.carbs}g · F{item.fat}g
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}