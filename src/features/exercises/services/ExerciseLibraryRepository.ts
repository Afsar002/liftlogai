import { db } from "../../../database/db";
import type { ExerciseDB } from "../../../database/types";

/**
 * ExerciseLibraryRepository — Dexie persistence for user-created custom
 * exercises. The bundled dataset lives in `src/data/exercises.json` and is
 * surfaced through ExerciseService; this repository only reads/writes the
 * `exercises` table for custom entries.
 */
export class ExerciseLibraryRepository {
  static async getCustom(): Promise<ExerciseDB[]> {
    return db.exercises.toArray();
  }

  static async create(payload: {
    name: string;
    muscle?: string;
    equipment?: string;
  }): Promise<ExerciseDB> {
    const id = crypto.randomUUID();

    const record: ExerciseDB = {
      id,
      name: payload.name,
      muscle: payload.muscle,
      equipment: payload.equipment,
      createdAt: new Date().toISOString(),
    };

    await db.exercises.put(record);
    return record;
  }
}
