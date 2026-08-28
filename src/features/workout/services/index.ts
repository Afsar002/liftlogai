/* ------------------------------------------------------------------ */
/* Workout Services - Unified Exports                                 */
/* ------------------------------------------------------------------ */

export * from "./WorkoutRepository";
export * from "./WorkoutSessionFactory";

// WgerTemplateService - explicitly re-export
export {
  fetchPublicTemplates,
  fetchTemplateById,
  fetchUserTemplates,
  invalidateWgerTemplateCache,
  hasFreshWgerTemplateCache,
  getCachedWgerTemplateCount,
  preloadWgerTemplates,
  getEnglishName,
  parseReps,
  parseRest,
} from "./WgerTemplateService";
export type { WgerTemplate } from "./WgerTemplateService";

// WgerWorkoutService - explicitly re-export
export {
  fetchWorkoutSessions,
  fetchWorkoutSessionById,
  createWorkoutSession,
  pushWorkoutToWger,
  invalidateWgerWorkoutCache,
  hasFreshWgerWorkoutCache,
  getCachedWgerWorkoutCount,
  preloadWgerWorkouts,
  getWorkoutSyncStatuses,
  setWorkoutSyncStatus,
} from "./WgerWorkoutService";
export type { WgerWorkout, WorkoutSyncStatus } from "./WgerWorkoutService";

// UnifiedTemplateService - explicitly re-export (main public API for templates)
export {
  getAllTemplates,
  searchPublicTemplates,
  getWgerTemplateById,
  importWgerTemplate,
  invalidateUnifiedTemplateCache,
  preloadPublicTemplates,
} from "./UnifiedTemplateService";

// UnifiedWorkoutService - explicitly re-export (main public API for workouts)
export {
  getLocalWorkouts,
  getLocalWorkoutById,
  saveLocalWorkout,
  deleteLocalWorkout,
  isSyncEnabled,
  getAccessToken,
  configureSync,
  disableSync,
  setAutoSync,
  getAutoSync,
  syncWithWger,
  pushWorkout,
  pullWorkout,
  getAllSyncStatuses,
  getSyncStatus,
  getLastSyncAt,
  invalidateUnifiedWorkoutCache,
  hasFreshUnifiedWorkoutCache,
  getCachedUnifiedWorkoutCount,
} from "./UnifiedWorkoutService";

/* Re-export types */
export type { WorkoutSession, LoggedExercise, LoggedSet } from "../types/session";
export type { WorkoutTemplateDB, TemplateExercise } from "../../../database/types";