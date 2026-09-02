import { db } from "../../../database/db";
import type { WorkoutHistory, ExerciseLog } from "../models/WorkoutHistory";

export type { WorkoutHistory };

/** Save a workout to history */
export async function saveWorkout(workout: WorkoutHistory): Promise<number> {
  return db.history.add(workout);
}

/** Get all workouts, newest first */
export async function getAllWorkouts(): Promise<WorkoutHistory[]> {
  return db.history.orderBy("completedAt").reverse().toArray();
}

/** Get workout by ID */
export async function getWorkoutById(id: number): Promise<WorkoutHistory | undefined> {
  return db.history.get(id);
}

/** Delete workout by ID */
export async function deleteWorkout(id: number): Promise<void> {
  await db.history.delete(id);
}

/** Clear all history */
export async function clearHistory(): Promise<void> {
  await db.history.clear();
}

/** Total workout count */
export async function totalWorkouts(): Promise<number> {
  return db.history.count();
}

/** Total training minutes */
export async function totalTrainingMinutes(): Promise<number> {
  const workouts = await db.history.toArray();
  return workouts.reduce((total, w) => total + w.durationMinutes, 0);
}

/** Total volume */
export async function totalVolume(): Promise<number> {
  const workouts = await db.history.toArray();
  return workouts.reduce((total, w) => total + w.totalVolume, 0);
}

/** Calculate volume from exercises */
export function calculateVolume(exercises: ExerciseLog[]): number {
  return exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0
    );
    return total + exerciseVolume;
  }, 0);
}