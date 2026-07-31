import { LoggedExercise } from "../types/session";

export class WorkoutService {
  static addSet(exercise: LoggedExercise): LoggedExercise {
    const nextNumber = exercise.sets.length + 1;

    return {
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          id: crypto.randomUUID(),
          setNumber: nextNumber,
          weight: 0,
          reps: 0,
          rir: 2,
          completed: false,
        },
      ],
    };
  }

  static removeSet(
    exercise: LoggedExercise,
    setId: string
  ): LoggedExercise {
    const sets = exercise.sets
      .filter((set) => set.id !== setId)
      .map((set, index) => ({
        ...set,
        setNumber: index + 1,
      }));

    return {
      ...exercise,
      sets,
    };
  }

  static updateSet(
    exercise: LoggedExercise,
    updatedSetId: string,
    field: "weight" | "reps" | "rir" | "completed",
    value: number | boolean
  ): LoggedExercise {
    return {
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === updatedSetId
          ? {
              ...set,
              [field]: value,
            }
          : set
      ),
    };
  }
}