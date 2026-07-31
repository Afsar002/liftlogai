import type { WorkoutSession } from "../types/session";

export function useWorkoutStats(
  session: WorkoutSession | null
) {
  if (!session) {
    return {
      totalSets: 0,
      completedSets: 0,
      totalExercises: 0,
      completedExercises: 0,
      totalVolume: 0,
    };
  }

  const allSets = session.exercises.flatMap(
    (exercise) => exercise.sets
  );

  const completedSets = allSets.filter(
    (set) => set.completed
  );

  // Count exercises that have at least one completed set (checkbox true)
  const completedExercises = session.exercises.filter(
    (exercise) => exercise.sets.some((set) => set.completed)
  ).length;

  const totalVolume = completedSets.reduce(
    (sum, set) => sum + set.weight * set.reps,
    0
  );

  return {
    totalSets: allSets.length,
    completedSets: completedSets.length,
    totalExercises: session.exercises.length,
    completedExercises,
    totalVolume,
  };
}
