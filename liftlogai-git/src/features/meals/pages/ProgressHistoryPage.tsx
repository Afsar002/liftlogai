import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiTrendingUp, FiZap, FiBarChart2 } from 'react-icons/fi';
import Layout from '../../../shared/components/layout/Layout';
import { MealsRepository } from '../repository/MealsRepository';
import type { NutritionProgress } from '../types';

export default function ProgressHistoryPage() {
  const [history, setHistory] = useState<NutritionProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await MealsRepository.getAllProgress();
        setHistory(data);
      } catch (err) {
        setError('Failed to load progress history');
        console.error('Error loading progress history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const totalDays = history.length;
  const avgCalories = totalDays > 0
    ? Math.round(history.reduce((sum, h) => sum + h.caloriesConsumed, 0) / totalDays)
    : 0;
  const avgGoal = totalDays > 0
    ? Math.round(history.reduce((sum, h) => sum + h.calorieGoal, 0) / totalDays)
    : 0;
  const onTrackDays = history.filter(h => h.caloriesConsumed <= h.calorieGoal).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-zinc-400 text-lg">Loading progress history...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Nutrition Progress</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your daily nutrition history
          </p>
        </div>

        {/* Summary Stats */}
        {totalDays > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Days Tracked</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalDays}</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Calories</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{avgCalories} kcal</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Goal</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{avgGoal} kcal</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">On Track</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{onTrackDays} / {totalDays}</p>
            </div>
          </div>
        )}

        {/* Progress List */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <FiBarChart2 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No progress recorded yet. Start logging your meals to track your nutrition history!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => {
              const percent = Math.min(100, Math.round((entry.caloriesConsumed / entry.calorieGoal) * 100));
              const isOnTrack = entry.caloriesConsumed <= entry.calorieGoal;

              return (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/progress/${entry.date}`)}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FiCalendar size={18} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {entry.mealsLogged} / 4 meals logged
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {entry.caloriesConsumed} / {entry.calorieGoal} kcal
                      </p>
                      <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOnTrack ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <FiZap
                      size={16}
                      className={isOnTrack ? 'text-green-500' : 'text-orange-500'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
