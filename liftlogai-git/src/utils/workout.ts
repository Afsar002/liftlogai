import { LoggedExercise } from "../types/session";

export function calculateWorkoutVolume(
  exercises: LoggedExercise[]
) {
  return exercises.reduce((volume, exercise) => {
    return (
      volume +
      exercise.sets.reduce(
        (sum, set) =>
          set.completed
            ? sum + set.weight * set.reps
            : sum,
        0
      )
    );
  }, 0);
}

export function calculateCompletedSets(
  exercises: LoggedExercise[]
) {
  return exercises.reduce((count, exercise) => {
    return (
      count +
      exercise.sets.filter(
        (set) => set.completed
      ).length
    );
  }, 0);
}
