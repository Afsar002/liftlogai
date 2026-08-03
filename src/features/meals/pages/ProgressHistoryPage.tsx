import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiTarget, FiTrendingUp } from 'react-icons/fi';
import Layout from '../../../shared/components/layout/Layout';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { AnimatedPage } from '../../../shared/components/motion';
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
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-44" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="card" className="h-24" />
            ))}
          </div>
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-16" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
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
              onClick={() => navigate('/meals')}
              aria-label="Back to meals"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            >
              <FiArrowLeft size={14} aria-hidden="true" />
            </button>

            <span className="mt-4 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
              Nutrition history
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
              Progress
            </h1>
            <p className="mt-1 text-xs font-semibold text-white/60">
              Track your daily nutrition history.
            </p>

            {totalDays > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
                  <FiCalendar size={11} aria-hidden="true" />
                  {totalDays} days
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80">
                  <FiTrendingUp size={11} aria-hidden="true" />
                  Avg {avgCalories} kcal
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80">
                  <FiCheckCircle size={11} aria-hidden="true" />
                  {onTrackDays} on track
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Summary Stats */}
        {totalDays > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <FiCalendar size={16} aria-hidden="true" />, label: 'Days tracked', value: String(totalDays), unit: 'days' },
              { icon: <FiTrendingUp size={16} aria-hidden="true" />, label: 'Avg calories', value: avgCalories.toLocaleString(), unit: 'kcal' },
              { icon: <FiTarget size={16} aria-hidden="true" />, label: 'Avg goal', value: avgGoal.toLocaleString(), unit: 'kcal' },
              { icon: <FiCheckCircle size={16} aria-hidden="true" />, label: 'On track', value: `${onTrackDays}/${totalDays}`, unit: 'days' },
            ].map((tile) => (
              <div key={tile.label} className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#141417]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {tile.icon}
                </span>
                <p className="mt-3 text-xl font-black tabular-nums leading-none text-zinc-950 dark:text-white">
                  {tile.value}
                  <span className="ml-1 text-xs font-bold text-zinc-400 dark:text-zinc-500">{tile.unit}</span>
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {tile.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Progress List */}
        {history.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 py-12 text-center dark:border-white/10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FiCalendar size={22} aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              No progress recorded yet. Start logging your meals to track your nutrition history!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => {
              const percent = Math.min(100, Math.round((entry.caloriesConsumed / entry.calorieGoal) * 100));
              const isOnTrack = entry.caloriesConsumed <= entry.calorieGoal;

              return (
                <button
                  key={entry.id}
                  onClick={() => navigate(`/progress/${entry.date}`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-200/70 bg-white px-4 py-3.5 text-left shadow-card transition-all duration-150 hover:border-zinc-300 hover:shadow-card-hover dark:border-white/6 dark:bg-[#141417] dark:hover:border-white/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isOnTrack ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                      <FiCalendar size={18} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {entry.mealsLogged} / 4 meals logged
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
                        {entry.caloriesConsumed} / {entry.calorieGoal} kcal
                      </p>
                      <div className="ml-auto mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isOnTrack ? 'bg-gradient-to-r from-emerald-500 to-lime-400' : 'bg-orange-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    {isOnTrack && (
                      <FiCheckCircle
                        size={18}
                        className="text-emerald-500"
                        aria-label="On track"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </AnimatedPage>
    </Layout>
  );
}
