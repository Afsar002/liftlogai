import { useEffect, useState } from "react";
import { getWorkoutHistory } from "../../../shared/lib/StatisticsEngine";
import type { WorkoutSession } from "../../workout/types/session";

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    setLoading(true);

    const data = await getWorkoutHistory();

    setWorkouts(data);

    setLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    workouts,
    loading,
    refresh: loadHistory,
  };
}