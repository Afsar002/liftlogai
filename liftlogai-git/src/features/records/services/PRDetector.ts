import { PersonalRecordRepository } from "./PersonalRecordRepository";

import type { LoggedExercise } from "../../workout/types/session";
import type { PersonalRecord } from "../../records/types";

export async function detectPRs(
  exercises: LoggedExercise[]
) {
  const newPRs = [];

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (!set.completed) continue;

      const estimated1RM =
        set.weight * (1 + set.reps / 30);

      const current =
        await PersonalRecordRepository.getByExercise(
          exercise.exerciseId
        );

      if (
        !current ||
        estimated1RM > current.estimated1RM
      ) {
        const record: PersonalRecord = {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,

          weight: set.weight,
          reps: set.reps,

          estimated1RM,

          achievedAt: new Date().toISOString(),
        };

        if (current?.id) {
          await PersonalRecordRepository.update(
            current.id,
            record
          );
        } else {
          await PersonalRecordRepository.save(record);
        }

        newPRs.push(record);
      }
    }
  }

  return newPRs;
}