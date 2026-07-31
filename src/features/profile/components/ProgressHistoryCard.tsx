import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiTrendingUp, FiZap } from 'react-icons/fi';
import Card from '../../../shared/components/ui/Card';
import SectionTitle from '../../../shared/components/ui/SectionTitle';
import { MealsRepository } from '../../meals/repository/MealsRepository';
import type { NutritionProgress } from '../../meals/types';

export default function ProgressHistoryCard() {
  const [history, setHistory] = useState<NutritionProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await MealsRepository.getProgressHistory(14);
        setHistory(data);
      } catch (err) {
        console.error('Error loading progress history:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card>
        <SectionTitle title="Nutrition Progress" action={<FiTrendingUp size={20} />} />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading progress...</p>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <SectionTitle title="Nutrition Progress" action={<FiTrendingUp size={20} />} />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No progress recorded yet. Log your meals to start tracking!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle
        title="Nutrition Progress"
        subtitle="Last 14 days"
        action={<FiTrendingUp size={20} />}
      />

      <div className="space-y-2">
        {history.map((entry) => {
          const percent = Math.min(100, Math.round((entry.caloriesConsumed / entry.calorieGoal) * 100));
          const isOnTrack = entry.caloriesConsumed <= entry.calorieGoal;

          return (
            <div
              key={entry.id}
              onClick={() => navigate(`/progress/${entry.date}`)}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiCalendar size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {entry.mealsLogged} / 4 meals
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {entry.caloriesConsumed} / {entry.calorieGoal} kcal
                  </p>
                  <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOnTrack ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
                <FiZap
                  size={14}
                  className={isOnTrack ? 'text-green-500' : 'text-orange-500'}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
