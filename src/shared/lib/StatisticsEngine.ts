import { db } from "../../database/db";
import type { WorkoutSessionDB } from "../../database/types";
import type { WorkoutSession } from "../../features/workout/types/session";

/* ------------------------------------------------------------------ */
/* Internal helpers                                                   */
/* ------------------------------------------------------------------ */

function convertToWorkoutSession(db: WorkoutSessionDB): WorkoutSession {
  return {
    id: db.id?.toString() ?? crypto.randomUUID(),
    workoutName: db.workoutName,
    startedAt: new Date(db.startedAt),
    exercises: db.exercises.map((ex) => ({
      id: ex.exerciseId,
      exerciseId: ex.exerciseId,
      name: ex.exerciseName,
      primaryMuscle: undefined,
      secondaryMuscles: [],
      sets: ex.sets.map((s) => ({
        id: crypto.randomUUID(),
        weight: s.weight,
        reps: s.reps,
        rir: 0,
        completed: s.completed,
      })),
    })),
  };
}

function estimate1RM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30));
}

/* ------------------------------------------------------------------ */
/* Public API - Workout History                                       */
/* ------------------------------------------------------------------ */

export async function getWorkoutHistory(): Promise<WorkoutSession[]> {
  const sessions = await db.workoutSessions
    .orderBy("finishedAt")
    .reverse()
    .toArray();
  return sessions.map(convertToWorkoutSession);
}

export async function getWorkoutById(id: number): Promise<WorkoutSession | undefined> {
  const session = await db.workoutSessions.get(id);
  return session ? convertToWorkoutSession(session) : undefined;
}

export async function getWorkoutByIdString(id: string): Promise<WorkoutSession | undefined> {
  const session = await db.workoutSessions.get(parseInt(id, 10));
  return session ? convertToWorkoutSession(session) : undefined;
}

/* ------------------------------------------------------------------ */
/* Public API - Exercise Statistics                                   */
/* ------------------------------------------------------------------ */

export interface ExerciseHistoryEntry {
  finishedAt: Date | undefined;
  sets: Array<{ weight: number; reps: number; completed: boolean }>;
}

export async function getExerciseHistory(exerciseName: string): Promise<ExerciseHistoryEntry[]> {
  const workouts = await getWorkoutHistory();

  return workouts
    .map((workout) => {
      const exercise = workout.exercises.find((e) => e.name === exerciseName);

      if (!exercise) return null;

      return {
        finishedAt: workout.finishedAt,
        sets: exercise.sets,
      };
    })
    .filter(Boolean) as ExerciseHistoryEntry[];
}

export interface PersonalRecord {
  weight: number;
  reps: number;
}

export async function getPersonalRecord(exerciseName: string): Promise<PersonalRecord> {
  const history = await getExerciseHistory(exerciseName);

  let bestWeight = 0;
  let bestReps = 0;

  history.forEach((workout) => {
    workout.sets.forEach((set) => {
      if (set.weight > bestWeight) {
        bestWeight = set.weight;
        bestReps = set.reps;
      }
    });
  });

  return {
    weight: bestWeight,
    reps: bestReps,
  };
}

export interface ProgressPoint {
  date: string;
  oneRM: number;
}

export async function getExerciseProgress(exerciseName: string): Promise<ProgressPoint[]> {
  const workouts = await getWorkoutHistory();

  return workouts
    .map((workout) => {
      const sets = workout.exercises
        .filter((exercise) => exercise.name === exerciseName)
        .flatMap((exercise) => exercise.sets)
        .filter((set) => set.completed);

      if (sets.length === 0) return null;

      const best = sets.reduce((a, b) => {
        const a1RM = estimate1RM(a.weight, a.reps);
        const b1RM = estimate1RM(b.weight, b.reps);

        return a1RM > b1RM ? a : b;
      });

      return {
        date: workout.finishedAt?.toISOString() ?? new Date().toISOString(),
        oneRM: estimate1RM(best.weight, best.reps),
      };
    })
    .filter((item): item is ProgressPoint => item !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/* ------------------------------------------------------------------ */
/* Public API - Dashboard Statistics                                  */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  streak: number;
  lastWorkout?: string;
  lastWorkoutDate?: string;
  workoutsThisWeek: number;
  totalVolume: number;
  averageDuration: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const workouts = await getWorkoutHistory();

  if (workouts.length === 0) {
    return {
      streak: 0,
      workoutsThisWeek: 0,
      totalVolume: 0,
      averageDuration: 0,
    };
  }

  const totalVolume = workouts.reduce(
    (sum, workout) => sum + (workout.totalVolume ?? 0),
    0
  );

  const averageDuration =
    workouts.reduce(
      (sum, workout) => sum + (workout.duration ?? 0),
      0
    ) / workouts.length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const workoutsThisWeek = workouts.filter(
    (workout) =>
      workout.finishedAt && new Date(workout.finishedAt) >= oneWeekAgo
  ).length;

  const lastWorkout = workouts[0];

  return {
    // Temporary until we build the streak calculator
    streak: workouts.length > 0 ? 1 : 0,

    lastWorkout: lastWorkout.workoutName,

    lastWorkoutDate: lastWorkout.finishedAt?.toISOString(),

    workoutsThisWeek,

    totalVolume,

    averageDuration: Math.round(averageDuration),
  };
}

/* ------------------------------------------------------------------ */
/* Public API - Write Operations                                      */
/* ------------------------------------------------------------------ */

export async function saveWorkout(workout: WorkoutSessionDB): Promise<number> {
  return await db.workoutSessions.add(workout);
}

export async function saveWorkoutFromSession(workout: WorkoutSession): Promise<number> {
  const dbWorkout: WorkoutSessionDB = {
    workoutName: workout.workoutName,
    startedAt: workout.startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    duration: 0,
    exercises: workout.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.name,
      sets: ex.sets.map((s) => ({
        weight: s.weight,
        reps: s.reps,
        completed: s.completed,
      })),
    })),
    totalSets: workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
    completedSets: workout.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    ),
    totalVolume: workout.exercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets.filter((s) => s.completed).reduce((s, set) => s + set.weight * set.reps, 0),
      0
    ),
  };
  return await db.workoutSessions.add(dbWorkout);
}

export async function deleteWorkout(id: number): Promise<void> {
  return await db.workoutSessions.delete(id);
}

export async function deleteWorkoutById(id: string): Promise<void> {
  return await db.workoutSessions.delete(parseInt(id, 10));
}

export async function clearHistory(): Promise<void> {
  return await db.workoutSessions.clear();
}

/* ------------------------------------------------------------------ */
/* Re-exports for backward compatibility                              */
/* ------------------------------------------------------------------ */

export { estimate1RM };