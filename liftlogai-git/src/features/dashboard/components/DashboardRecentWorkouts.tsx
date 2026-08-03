import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiChevronRight,
} from "react-icons/fi";

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
    const history =
      await HistoryRepository.getAll();

    setWorkouts(history.slice(0, 3));
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  }
  

  return (
    <Card>
      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiClock className="text-green-600 dark:text-green-400" />

            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Recent Workouts
            </h2>
          </div>

          <button
            onClick={() => navigate("/history")}
            className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
          >
            See All
          </button>
        </div>

        {workouts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-slate-50 py-8 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">
              No workouts completed yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <button
                key={workout.id}
                onClick={() =>
                  navigate("/history")
                }
                className="flex w-full items-center justify-between rounded-xl bg-slate-100 p-4 text-slate-950 transition hover:bg-slate-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-slate-950 dark:text-white">
                    {workout.templateName}
                  </h3>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(
                      workout.completedAt
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {workout.totalVolume.toLocaleString()} kg
                  </span>

                  <FiChevronRight className="text-zinc-500 dark:text-zinc-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}