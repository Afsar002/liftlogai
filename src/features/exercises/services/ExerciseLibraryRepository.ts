import { db } from "../../../database/db";
import type { ExerciseDB } from "../../../database/types";

export class ExerciseLibraryRepository {
  static async getAll(): Promise<ExerciseDB[]> {
    const saved = await db.exercises.toArray();
    const { exerciseLibrary } = await import("../data/exerciseLibrary");
    const builtins = exerciseLibrary;

    const merged = [
      ...builtins.map((b) => ({
        id: b.id,
        name: b.name,
        muscle: b.muscle,
        equipment: b.equipment,
      })),
      ...saved,
    ];

    return merged;
  }

  static async getById(id: string): Promise<ExerciseDB | undefined> {
    const saved = await db.exercises.get(id);
    if (saved) return saved;
    const builtins = (await import("../data/exerciseLibrary")).exerciseLibrary;
    return builtins.find((b) => b.id === id);
  }

  static async create(payload: {
    name: string;
    muscle?: string;
    equipment?: string;
  }) {
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
