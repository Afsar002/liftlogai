import { useEffect, useState } from "react";
import { WorkoutRepository } from "../../workout/services/WorkoutRepository";
import type { WorkoutSessionDB } from "../../../database/types";

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutSessionDB[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    setLoading(true);

    const data =
      await WorkoutRepository.getWorkoutHistory();

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