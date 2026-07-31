import { db } from "../../../database/db";

import type {
  WorkoutHistory,
  ExerciseLog,
} from "../models/WorkoutHistory";

export class HistoryRepository {
  static async save(
    workout: WorkoutHistory
  ): Promise<number> {
    return await db.history.add(workout);
  }

  static async getAll(): Promise<WorkoutHistory[]> {
    return await db.history
      .orderBy("completedAt")
      .reverse()
      .toArray();
  }

  static async getById(
    id: number
  ): Promise<WorkoutHistory | undefined> {
    return await db.history.get(id);
  }

  static async delete(
    id: number
  ): Promise<void> {
    await db.history.delete(id);
  }

  static async clear(): Promise<void> {
    await db.history.clear();
  }

  static async totalWorkouts(): Promise<number> {
    return await db.history.count();
  }

  static async totalTrainingMinutes(): Promise<number> {
    const workouts = await db.history.toArray();

    return workouts.reduce(
      (total, workout) => total + workout.durationMinutes,
      0
    );
  }

  static async totalVolume(): Promise<number> {
    const workouts = await db.history.toArray();

    return workouts.reduce(
      (total, workout) => total + workout.totalVolume,
      0
    );
  }

  static calculateVolume(
    exercises: ExerciseLog[]
  ): number {
    return exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0
      );

      return total + exerciseVolume;
    }, 0);
  }
}