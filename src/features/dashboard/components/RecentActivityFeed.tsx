import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronRight, FiClock, FiAward, FiTrendingUp } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { HistoryRepository } from "../../history/repositories/HistoryRepository";
import type { WorkoutHistory } from "../../history/models/WorkoutHistory";
import { cn } from "../../../shared/lib/cn";
import { spring, listContainer, listItem } from "../../../shared/components/motion/variants";

interface RecentActivityFeedProps {
  limit?: number;
}

/**
 * Timeline-style recent activity feed with PR badges and staggered entrance.
 */
export default function RecentActivityFeed({ limit = 5 }: RecentActivityFeedProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [workouts, setWorkouts] = useState<WorkoutHistory[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    const history = await HistoryRepository.getAll();
    setWorkouts(history.slice(0, limit));
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getDaysAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
              <FiClock size={18} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Recent Workouts
            </h2>
          </div>
        </div>

        <div className="mt-5">
          <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center dark:border-white/10">
            <p className="text-zinc-600 dark:text-zinc-400">No workouts completed yet.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
            <FiClock size={18} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Recent Activity
          </h2>
        </div>

        <button
          onClick={() => navigate("/history")}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          See All
        </button>
      </div>

      <div className="mt-5">
        <motion.ul
          className="space-y-3"
          variants={listContainer}
          initial="hidden"
          animate="show"
        >
          {workouts.map((workout, index) => (
            <motion.li
              key={workout.id}
              variants={listItem}
              className="group relative flex items-center gap-4 rounded-xl p-3 bg-zinc-50 dark:bg-white/3 transition-colors hover:bg-zinc-100 dark:hover:bg-white/6"
            >
              {/* Timeline dot */}
              <motion.div
                className="relative flex-shrink-0 flex h-10 w-10 items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-500/10" />
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                  <FiTrendingUp size={10} className="text-emerald-950" aria-hidden="true" />
                </div>
                {/* Timeline line */}
                <div className="absolute left-1/2 top-full h-full w-0.5 -translate-x-1/2 bg-zinc-200 dark:bg-white/10" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
                    {workout.templateName}
                  </h3>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(workout.completedAt)} • {getDaysAgo(workout.completedAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {workout.totalVolume.toLocaleString()} kg
                </span>
                <FiChevronRight className="text-zinc-400" aria-hidden="true" />
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* Add a final timeline end marker */}
        <div className="flex items-center gap-4 pt-2">
          <div className="relative flex-shrink-0 flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-zinc-200/50 dark:bg-white/5" />
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5" />
          </div>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            End of recent activity
          </p>
        </div>
      </div>
    </Card>
  );
}