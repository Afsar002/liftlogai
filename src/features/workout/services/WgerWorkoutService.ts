import type { WorkoutSession } from "../types/session";
import { workoutSync } from "../../../shared/lib/SyncManager";

/* ------------------------------------------------------------------ */
/* wger API types (minimal subset we need)                            */
/* ------------------------------------------------------------------ */

interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface WgerWorkoutSession {
  id: number;
  uuid: string;
  created: string;
  last_update: string;
  start_time: string; // ISO datetime
  end_time: string | null;
  comment: string;
  routine: number | null;
  routine_detail: {
    id: number;
    name: string;
  } | null;
  days: WgerWorkoutDay[];
}

interface WgerWorkoutDay {
  id: number;
  uuid: string;
  order: number;
  workout: number;
  exercises: WgerWorkoutExercise[];
}

interface WgerWorkoutExercise {
  id: number;
  uuid: string;
  order: number;
  day: number;
  exercise: number; // exerciseinfo ID
  exercise_detail: {
    id: number;
    uuid: string;
    translations: Array<{
      language: number;
      name: string;
      description: string;
    }>;
  };
  sets: WgerSet[];
}

interface WgerSet {
  id: number;
  uuid: string;
  order: number;
  exercise: number;
  weight: number;
  weight_unit: string; // "kg" or "lb"
  reps: number;
  rir: number | null;
  rpe: number | null;
  distance: number | null;
  distance_unit: string | null;
  duration: number | null; // seconds
  completed: boolean;
  created: string;
  last_update: string;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const WGER_BASE_URL = "https://wger.de/api/v2";
const DEFAULT_LANGUAGE = 2; // English
const CACHE_KEY = "liftlog_wger_workouts";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (workouts change less frequently)

/* ------------------------------------------------------------------ */
/* Cache helpers                                                      */
/* ------------------------------------------------------------------ */

interface CachedWorkoutData {
  timestamp: number;
  workouts: WgerWorkout[];
}

export interface WgerWorkout {
  id: string; // deterministic from uuid
  uuid: string;
  name: string; // from routine or "Custom Workout"
  startedAt: string; // ISO string
  endedAt: string | null;
  comment: string;
  routineId: number | null;
  routineName: string | null;
  exercises: WgerWorkoutExercise[];
  totalSets: number;
  totalVolume: number; // kg * reps
  source: "wger";
}

function readCache(): CachedWorkoutData | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWorkoutData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(workouts: WgerWorkout[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), workouts }));
  } catch {
    // Ignore quota errors
  }
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                       */
/* ------------------------------------------------------------------ */

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en",
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`wger API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function fetchAllPages<T>(initialUrl: string, options?: RequestInit): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = initialUrl;
  while (url) {
    const response: WgerPaginatedResponse<T> = await fetchJson<WgerPaginatedResponse<T>>(url, options);
    results.push(...response.results);
    url = response.next;
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* Transform helpers                                                  */
/* ------------------------------------------------------------------ */

function getEnglishName(exercise: WgerWorkoutExercise["exercise_detail"]): string {
  const translation = exercise.translations.find((t) => t.language === DEFAULT_LANGUAGE);
  return translation?.name?.trim() ?? `Exercise ${exercise.id}`;
}

function calculateVolume(sets: WgerSet[]): number {
  return sets
    .filter((s) => s.completed && s.weight > 0 && s.reps > 0)
    .reduce((sum, s) => sum + s.weight * s.reps, 0);
}

function transformWorkoutSession(api: WgerWorkoutSession): WgerWorkout {
  const allExercises = api.days.flatMap((day) => day.exercises);
  const totalSets = allExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalVolume = allExercises.reduce((sum, ex) => sum + calculateVolume(ex.sets), 0);

  return {
    id: `wger-workout-${api.uuid}`,
    uuid: api.uuid,
    name: api.routine_detail?.name ?? "Custom Workout",
    startedAt: api.start_time,
    endedAt: api.end_time,
    comment: api.comment,
    routineId: api.routine,
    routineName: api.routine_detail?.name ?? null,
    exercises: allExercises,
    totalSets,
    totalVolume,
    source: "wger",
  };
}

/* ------------------------------------------------------------------ */
/* Public API - Read (no auth needed for own data with token)         */
/* ------------------------------------------------------------------ */

/**
 * Fetches all workout sessions for the authenticated user.
 * Requires access token.
 */
export async function fetchWorkoutSessions(
  accessToken: string,
  forceRefresh = false
): Promise<WgerWorkout[]> {
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) return cached.workouts;
  }

  try {
    const sessions = await fetchAllPages<WgerWorkoutSession>(
      `${WGER_BASE_URL}/workoutsession/?ordering=-start_time&limit=100`,
      {
        headers: {
          "Authorization": `Token ${accessToken}`,
        },
      }
    );

    const workouts = sessions.map(transformWorkoutSession);
    writeCache(workouts);
    return workouts;
  } catch (error) {
    console.error("[WgerWorkoutService] Failed to fetch workout sessions:", error);
    const cached = readCache();
    if (cached) return cached.workouts;
    throw error;
  }
}

/**
 * Fetches a single workout session by UUID with full detail.
 */
export async function fetchWorkoutSessionById(
  uuid: string,
  accessToken: string
): Promise<WgerWorkout | null> {
  try {
    const session: WgerWorkoutSession = await fetchJson(
      `${WGER_BASE_URL}/workoutsession/${uuid}/`,
      { headers: { "Authorization": `Token ${accessToken}` } }
    );
    return transformWorkoutSession(session);
  } catch (error) {
    console.error("[WgerWorkoutService] Failed to fetch workout session:", error);
    return null;
  }
}

/**
 * Converts a wger workout to our local WorkoutSession format.
 * Requires exercise ID mapping from wger exerciseinfo ID -> our Exercise.id
 */
export function convertToLocalWorkout(
  wgerWorkout: WgerWorkout,
  exerciseIdMap: Map<number, string> // wger exerciseinfo.id -> local Exercise.id
): WorkoutSession | null {
  const exercises = wgerWorkout.exercises
    .filter((ex) => exerciseIdMap.has(ex.exercise))
    .map((ex) => {
      const exerciseId = exerciseIdMap.get(ex.exercise)!;
      const sets = ex.sets
        .filter((s) => s.completed)
        .map((s) => ({
          id: `wger-set-${s.uuid}`,
          weight: s.weight,
          reps: s.reps,
          rir: s.rir ?? 0,
          completed: true,
        }));

      if (sets.length === 0) return null;

      return {
        id: `wger-exercise-${ex.uuid}`,
        exerciseId,
        name: getEnglishName(ex.exercise_detail),
        primaryMuscle: undefined, // Would need separate lookup
        secondaryMuscles: [],
        sets,
      };
    })
    .filter((ex): ex is NonNullable<typeof ex> => ex !== null);

  if (exercises.length === 0) return null;

  return {
    id: wgerWorkout.id,
    workoutName: wgerWorkout.name,
    startedAt: new Date(wgerWorkout.startedAt),
    exercises,
  };
}

/* ------------------------------------------------------------------ */
/* Public API - Write (requires auth)                                 */
/* ------------------------------------------------------------------ */

interface CreateWorkoutSessionPayload {
  routine?: number; // routine ID
  start_time: string; // ISO datetime
  end_time?: string;
  comment?: string;
  days: CreateWorkoutDayPayload[];
}

interface CreateWorkoutDayPayload {
  order: number;
  exercises: CreateWorkoutExercisePayload[];
}

interface CreateWorkoutExercisePayload {
  order: number;
  exercise: number; // exerciseinfo ID
  sets: CreateSetPayload[];
}

interface CreateSetPayload {
  order: number;
  weight: number;
  weight_unit: "kg" | "lb";
  reps: number;
  rir?: number | null;
  rpe?: number | null;
  distance?: number | null;
  distance_unit?: string | null;
  duration?: number | null;
  completed: boolean;
}

/**
 * Creates a new workout session on wger.
 * Returns the created session UUID on success.
 */
export async function createWorkoutSession(
  payload: CreateWorkoutSessionPayload,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/workoutsession/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Token ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[WgerWorkoutService] Create workout failed:", error);
      return null;
    }

    const created = await response.json();
    invalidateWgerWorkoutCache();
    return created.uuid;
  } catch (error) {
    console.error("[WgerWorkoutService] Failed to create workout session:", error);
    return null;
  }
}

/**
 * Converts our local WorkoutSession to wger payload and pushes it.
 * Requires exercise ID reverse mapping (local Exercise.id -> wger exerciseinfo.id)
 */
export async function pushWorkoutToWger(
  workout: WorkoutSession,
  accessToken: string,
  exerciseIdReverseMap: Map<string, number>
): Promise<string | null> {
  const dayExercises = new Map<number, CreateWorkoutExercisePayload[]>();

  // Local set weights are stored in the user's preferred unit (settings.weightUnit).
  // Mirror the pull path (which stores wger weights as-is), so only attach the
  // correct unit label instead of assuming weight is always kg.
  const weightUnit = workoutSync.getPreferredUnit();

  workout.exercises.forEach((ex, exerciseIndex) => {
    const wgerExerciseId = exerciseIdReverseMap.get(ex.exerciseId);
    if (!wgerExerciseId) return;

    const sets: CreateSetPayload[] = ex.sets.map((set, setIndex) => ({
      order: setIndex + 1,
      weight: set.weight,
      weight_unit: weightUnit,
      reps: set.reps,
      rir: set.rir,
      rpe: null,
      distance: null,
      distance_unit: null,
      duration: null,
      completed: set.completed,
    }));

    const dayOrder = 1; // For now, single day; could split by exercise groups later
    if (!dayExercises.has(dayOrder)) dayExercises.set(dayOrder, []);
    dayExercises.get(dayOrder)!.push({
      order: exerciseIndex + 1,
      exercise: wgerExerciseId,
      sets,
    });
  });

  const payload: CreateWorkoutSessionPayload = {
    start_time: workout.startedAt.toISOString(),
    end_time: new Date().toISOString(),
    comment: `Synced from LiftLogAI`,
    days: Array.from(dayExercises.entries()).map(([order, exercises]) => ({
      order,
      exercises,
    })),
  };

  return createWorkoutSession(payload, accessToken);
}

/* ------------------------------------------------------------------ */
/* Sync helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Sync status for a local workout.
 */
export interface WorkoutSyncStatus {
  localId: string;
  remoteUuid: string | null;
  status: "synced" | "pending" | "conflict" | "error";
  lastSyncedAt: string | null;
}

/**
 * Gets sync status for all local workouts (stored in localStorage).
 */
export function getWorkoutSyncStatuses(): WorkoutSyncStatus[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = localStorage.getItem("liftlog_workout_sync_status");
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutSyncStatus[];
  } catch {
    return [];
  }
}

/**
 * Updates sync status for a workout.
 */
export function setWorkoutSyncStatus(status: WorkoutSyncStatus): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const statuses = getWorkoutSyncStatuses();
    const index = statuses.findIndex((s) => s.localId === status.localId);
    if (index >= 0) {
      statuses[index] = status;
    } else {
      statuses.push(status);
    }
    localStorage.setItem("liftlog_workout_sync_status", JSON.stringify(statuses));
  } catch {
    // Ignore
  }
}

/**
 * Invalidates the local wger workout cache.
 */
export function invalidateWgerWorkoutCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Checks if cached wger workout data exists and is fresh.
 */
export function hasFreshWgerWorkoutCache(): boolean {
  const cached = readCache();
  return cached !== null;
}

/**
 * Gets the count of cached wger workouts.
 */
export function getCachedWgerWorkoutCount(): number {
  const cached = readCache();
  return cached?.workouts.length ?? 0;
}

/**
 * Preloads wger workouts in background (requires token).
 */
export function preloadWgerWorkouts(accessToken: string): void {
  fetchWorkoutSessions(accessToken).catch(() => {
    // Swallow - best effort
  });
}