import { db } from "../../../database/db";

export class AnalyticsRepository {
  static async getWorkoutHistory() {
    return db.history.toArray();
  }

  static async getPersonalRecords() {
    return db.personalRecords.toArray();
  }
  static async getWeeklyVolume() {
    return db.history.toArray();
}
}