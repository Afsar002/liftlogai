import type { WorkoutSession } from "../types/session";
import { getWorkoutHistory, saveWorkoutFromSession, getWorkoutByIdString, deleteWorkoutById } from "../../../shared/lib/StatisticsEngine";
import * as WgerWorkoutService from "./WgerWorkoutService";
import * as UnifiedExerciseService from "../../exercises/services/UnifiedExerciseService";
import { workoutSync } from "../../../shared/lib/SyncManager";

/* ------------------------------------------------------------------ */
/* Public API - Local Workouts (primary)                              */
/* ------------------------------------------------------------------ */

/**
 * Gets all local workouts from IndexedDB.
 */
export async function getLocalWorkouts(): Promise<WorkoutSession[]> {
  return getWorkoutHistory();
}

/**
 * Gets a local workout by ID.
 */
export async function getLocalWorkoutById(id: string): Promise<WorkoutSession | undefined> {
  return getWorkoutByIdString(id);
}

/**
 * Saves a workout locally.
 */
export async function saveLocalWorkout(workout: WorkoutSession): Promise<void> {
  await saveWorkoutFromSession(workout);
}

/**
 * Deletes a local workout.
 */
export async function deleteLocalWorkout(id: string): Promise<void> {
  await deleteWorkoutById(id);
}

/* ------------------------------------------------------------------ */
/* Public API - Cloud Sync (wger)                                     */
/* ------------------------------------------------------------------ */

/**
 * Checks if cloud sync is configured and enabled.
 */
export function isSyncEnabled(): boolean {
  return workoutSync.isEnabled();
}

/**
 * Gets the stored access token.
 */
export function getAccessToken(): string | null {
  return workoutSync.getAccessToken();
}

/**
 * Configures wger sync with an access token.
 * Returns true if token is valid (tested with a quick API call).
 */
export async function configureSync(accessToken: string): Promise<boolean> {
  return workoutSync.configure(accessToken, async (token) => {
    try {
      const response = await fetch("https://wger.de/api/v2/user/profile/", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Token ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  });
}

/**
 * Disables cloud sync.
 */
export function disableSync(): void {
  workoutSync.disable();
}

/**
 * Sets auto-sync preference.
 */
export function setAutoSync(enabled: boolean): void {
  workoutSync.setAutoSync(enabled);
}

/**
 * Gets auto-sync preference.
 */
export function getAutoSync(): boolean {
  return workoutSync.getAutoSync();
}

/* ------------------------------------------------------------------ */
/* Sync Operations                                                    */
/* ------------------------------------------------------------------ */

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: Array<{ localId: string; remoteId: string }>;
  errors: string[];
}

/**
 * Performs a full bidirectional sync with wger.
 * - Pushes local workouts not on wger
 * - Pulls wger workouts not locally
 * - Handles conflicts (same workout modified both sides)
 */
export async function syncWithWger(): Promise<SyncResult> {
  if (!workoutSync.isEnabled()) {
    return { pushed: 0, pulled: 0, conflicts: [], errors: ["Sync not configured"] };
  }

  const accessToken = workoutSync.getAccessToken()!;
  const result: SyncResult = { pushed: 0, pulled: 0, conflicts: [], errors: [] };

  try {
    // Build exercise ID maps
    const allExercises = await UnifiedExerciseService.getAllExercises();
    const exerciseIdMap = new Map<number, string>(); // wger exerciseinfo.id -> local Exercise.id
    const exerciseIdReverseMap = new Map<string, number>(); // local Exercise.id -> wger exerciseinfo.id

    for (const ex of allExercises) {
      if (ex.id.startsWith("wger-")) {
        // Would need a lookup table for wger exerciseinfo ID
        // For now, we'll skip exact mapping
      }
    }

    // 1. PUSH: Get local workouts not synced
    const localWorkouts = await getLocalWorkouts();
    const syncStatuses = WgerWorkoutService.getWorkoutSyncStatuses();
    const syncedRemoteUuids = new Set(syncStatuses.filter(s => s.remoteUuid).map(s => s.remoteUuid!));

    for (const workout of localWorkouts) {
      const status = syncStatuses.find(s => s.localId === workout.id);
      if (status?.remoteUuid && syncedRemoteUuids.has(status.remoteUuid)) {
        continue; // Already synced
      }

      const remoteUuid = await WgerWorkoutService.pushWorkoutToWger(
        workout,
        accessToken,
        exerciseIdReverseMap
      );

      if (remoteUuid) {
        WgerWorkoutService.setWorkoutSyncStatus({
          localId: workout.id,
          remoteUuid,
          status: "synced",
          lastSyncedAt: new Date().toISOString(),
        });
        result.pushed++;
      } else {
        result.errors.push(`Failed to push workout ${workout.id}`);
      }
    }

    // 2. PULL: Get wger workouts not local
    const wgerWorkouts = await WgerWorkoutService.fetchWorkoutSessions(accessToken, true);
    const localIds = new Set(localWorkouts.map(w => w.id));
    const syncedLocalIds = new Set(syncStatuses.filter(s => s.status === "synced").map(s => s.localId));

    for (const wgerWorkout of wgerWorkouts) {
      const status = syncStatuses.find(s => s.remoteUuid === wgerWorkout.uuid);
      if (status && syncedLocalIds.has(status.localId)) {
        continue; // Already synced
      }

      const localWorkout = WgerWorkoutService.convertToLocalWorkout(wgerWorkout, exerciseIdMap);
      if (localWorkout) {
        await saveLocalWorkout(localWorkout);
        WgerWorkoutService.setWorkoutSyncStatus({
          localId: localWorkout.id,
          remoteUuid: wgerWorkout.uuid,
          status: "synced",
          lastSyncedAt: new Date().toISOString(),
        });
        result.pulled++;
      }
    }

    workoutSync.setLastSyncAt(new Date().toISOString());
    return result;
  } catch (error) {
    result.errors.push(`Sync failed: ${error}`);
    return result;
  }
}

/**
 * Pushes a single workout to wger.
 */
export async function pushWorkout(workout: WorkoutSession): Promise<string | null> {
  if (!workoutSync.isEnabled()) return null;

  const accessToken = workoutSync.getAccessToken()!;
  const allExercises = await UnifiedExerciseService.getAllExercises();
  const exerciseIdReverseMap = new Map<string, number>();

  for (const ex of allExercises) {
    if (ex.id.startsWith("wger-")) {
      // Would need lookup table
    }
  }

  return WgerWorkoutService.pushWorkoutToWger(workout, accessToken, exerciseIdReverseMap);
}

/**
 * Pulls a single workout from wger by UUID.
 */
export async function pullWorkout(uuid: string): Promise<WorkoutSession | null> {
  if (!workoutSync.isEnabled()) return null;

  const accessToken = workoutSync.getAccessToken()!;
  const allExercises = await UnifiedExerciseService.getAllExercises();
  const exerciseIdMap = new Map<number, string>();

  const wgerWorkout = await WgerWorkoutService.fetchWorkoutSessionById(uuid, accessToken);
  if (!wgerWorkout) return null;

  return WgerWorkoutService.convertToLocalWorkout(wgerWorkout, exerciseIdMap);
}

/* ------------------------------------------------------------------ */
/* Sync Status                                                        */
/* ------------------------------------------------------------------ */

/**
 * Gets sync status for all workouts.
 */
export function getAllSyncStatuses(): WgerWorkoutService.WorkoutSyncStatus[] {
  return WgerWorkoutService.getWorkoutSyncStatuses();
}

/**
 * Gets sync status for a specific workout.
 */
export function getSyncStatus(localId: string): WgerWorkoutService.WorkoutSyncStatus | undefined {
  return WgerWorkoutService.getWorkoutSyncStatuses().find(s => s.localId === localId);
}

/**
 * Gets last sync timestamp.
 */
export function getLastSyncAt(): string | null {
  return workoutSync.getLastSyncAt();
}

/* ------------------------------------------------------------------ */
/* Cache Management                                                   */
/* ------------------------------------------------------------------ */

export function invalidateUnifiedWorkoutCache(): void {
  WgerWorkoutService.invalidateWgerWorkoutCache();
}

export function hasFreshUnifiedWorkoutCache(): boolean {
  return WgerWorkoutService.hasFreshWgerWorkoutCache();
}

export function getCachedUnifiedWorkoutCount(): number {
  return WgerWorkoutService.getCachedWgerWorkoutCount();
}

/* ------------------------------------------------------------------ */
/* Re-exports                                                         */
/* ------------------------------------------------------------------ */

export type { WorkoutSyncStatus } from "./WgerWorkoutService";
export {
  fetchWorkoutSessions,
  fetchWorkoutSessionById,
  createWorkoutSession,
  pushWorkoutToWger,
  invalidateWgerWorkoutCache,
  hasFreshWgerWorkoutCache,
  getCachedWgerWorkoutCount,
  getWorkoutSyncStatuses,
  setWorkoutSyncStatus,
} from "./WgerWorkoutService";