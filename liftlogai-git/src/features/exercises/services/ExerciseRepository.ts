import { WorkoutRepository } from "../../workout/services/WorkoutRepository";


export function estimate1RM(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30));
}


export class ExerciseRepository {
  static async getExerciseHistory(exerciseName: string) {
  const workouts = await WorkoutRepository.getWorkoutHistory();

  return workouts
    .map(workout => {
      const exercise = workout.exercises.find(
        e => e.exerciseName === exerciseName
      );

      if (!exercise) return null;

      return {
        finishedAt: workout.finishedAt,
        sets: exercise.sets,
      };
    })
    .filter(Boolean);
}
  static async getPersonalRecord(
    exerciseName: string
) {
    const history =
        await this.getExerciseHistory(exerciseName);

    let bestWeight = 0;
    let bestReps = 0;

    history.forEach((workout: any) => {
        workout.sets.forEach((set: any) => {
            if (set.weight > bestWeight) {
                bestWeight = set.weight;
                bestReps = set.reps;
            }
        });
    });

    return {
        weight: bestWeight,
        reps: bestReps,
    };
}

static async getProgress(exerciseName: string) {
  const workouts = await WorkoutRepository.getWorkoutHistory();

  return workouts
    .map(workout => {
      const sets = workout.exercises
        .filter(exercise => exercise.exerciseName === exerciseName)
        .flatMap(exercise => exercise.sets)
        .filter(set => set.completed);

      if (sets.length === 0) return null;

      const best = sets.reduce((a, b) => {
        const a1RM = estimate1RM(a.weight, a.reps);
        const b1RM = estimate1RM(b.weight, b.reps);

        return a1RM > b1RM ? a : b;
      });

      return {
        date: workout.finishedAt,
        oneRM: estimate1RM(best.weight, best.reps),
      };
    })
    .filter(
      (item): item is { date: string; oneRM: number } =>
        item !== null
    )
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
}

}