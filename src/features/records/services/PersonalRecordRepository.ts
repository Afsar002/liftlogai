import { db } from "../../../database/db";

import type { PersonalRecord } from "../../records/types";
export class PersonalRecordRepository {
  static async getAll() {
    return db.personalRecords.toArray();
  }

  static async getByExercise(exerciseId: string) {
    return db.personalRecords
      .where("exerciseId")
      .equals(exerciseId)
      .first();
  }

  static async save(record: PersonalRecord) {
    return db.personalRecords.add(record);
  }

  static async update(
    id: number,
    record: PersonalRecord
  ) {
    return db.personalRecords.update(id, record);
  }

  static async delete(id: number) {
    return db.personalRecords.delete(id);
  }
}