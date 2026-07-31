import type { WorkoutTemplateDB } from "../../../database/types";
import type { WorkoutSession } from "../types/session";

export class WorkoutSessionFactory {
  static create(template: WorkoutTemplateDB): WorkoutSession {
    return {
      id: crypto.randomUUID(),

      workoutName: template.name,

      startedAt: new Date(),

      exercises: template.exercises.map((exercise) => ({
        id: crypto.randomUUID(),

        exerciseId: exercise.id,

        name: exercise.name,

        previous: "-",

        sets: Array.from(
          { length: exercise.targetSets },
          () => ({
            id: crypto.randomUUID(),

            weight: 0,

            reps: 0,

            rir: 2,

            completed: false,
          })
        ),
      })),
    };
  }
}