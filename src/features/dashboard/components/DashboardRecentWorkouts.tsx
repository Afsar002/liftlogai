import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiClock } from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";
import { HistoryRepository } from "../../history/repositories/HistoryRepository";
import type { WorkoutHistory } from "../../history/models/WorkoutHistory";

export default function DashboardRecentWorkouts() {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<
    WorkoutHistory[]
  >([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    const history = await HistoryRepository.getAll();
    setWorkouts(history.slice(0, 3));
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

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

        <button
          onClick={() => navigate("/history")}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          See All
        </button>
      </div>

      <div className="mt-5">
        {workouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center dark:border-white/10">
            <p className="text-zinc-600 dark:text-zinc-400">
              No workouts completed yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workouts.map((workout) => (
              <button
                key={workout.id}
                onClick={() => navigate("/history")}
                className="flex w-full items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/8"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
                    {workout.templateName}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(workout.completedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {workout.totalVolume.toLocaleString()} kg
                  </span>
                  <FiChevronRight className="text-zinc-400" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
