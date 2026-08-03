import { db } from "../../../database/db";
import type { WorkoutSessionDB } from "../../../database/types";

export class WorkoutRepository {
  static async saveWorkout(
    workout: WorkoutSessionDB
  ) {
    return await db.workoutSessions.add(workout);
  }

  static async getWorkoutHistory() {
    return await db.workoutSessions
      .orderBy("finishedAt")
      .reverse()
      .toArray();
  }

  static async getWorkout(
    id: number
  ) {
    return await db.workoutSessions.get(id);
  }

  static async deleteWorkout(
    id: number
  ) {
    return await db.workoutSessions.delete(id);
  }

  static async clearHistory() {
    return await db.workoutSessions.clear();
  }
}