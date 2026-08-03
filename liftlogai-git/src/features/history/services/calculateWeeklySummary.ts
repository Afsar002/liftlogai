import type { WorkoutHistory } from "../models/WorkoutHistory";
import type { WeeklySummary } from "../types/WeeklySummary";

export function calculateWeeklySummary(
  history: WorkoutHistory[]
): WeeklySummary {
  const now = new Date();

  // Monday as the start of the week
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);

  const day = startOfWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;

  startOfWeek.setDate(startOfWeek.getDate() - diff);

  const workouts = history.filter(
    workout => new Date(workout.completedAt) >= startOfWeek
  );

  return {
    workouts: workouts.length,

    durationMinutes: workouts.reduce(
      (sum, workout) => sum + workout.durationMinutes,
      0
    ),

    totalVolume: workouts.reduce(
      (sum, workout) =>
        sum +
        workout.exercises.reduce(
          (exerciseTotal, exercise) =>
            exerciseTotal +
            exercise.sets.reduce(
              (setTotal, set) =>
                setTotal + set.weight * set.reps,
              0
            ),
          0
        ),
      0
    ),
    totalSets: workouts.reduce(
  (sum, workout) =>
    sum +
    workout.exercises.reduce(
      (exerciseSum, exercise) =>
        exerciseSum + exercise.sets.length,
      0
    ),
  0
),
  };
}