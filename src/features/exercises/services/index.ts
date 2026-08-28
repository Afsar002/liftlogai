/* ------------------------------------------------------------------ */
/* Exercise Services - Unified Exports                                */
/* ------------------------------------------------------------------ */

// Repository exports
export * from "./ExerciseRepository";
export * from "./ExerciseLibraryRepository";

// Local ExerciseService - explicitly re-export to avoid conflicts with UnifiedExerciseService
export {
  loadExercises,
  getExerciseById as getLocalExerciseById,
  getAllExercises as getLocalAllExercises,
  searchExercises as searchLocalExercises,
  getByEquipment as getLocalByEquipment,
  getByMuscle as getLocalByMuscle,
  getByCategory as getLocalByCategory,
  getByDifficulty as getLocalByDifficulty,
  getFilterOptions as getLocalFilterOptions,
  getFavorites as getLocalFavorites,
  getFavoriteIds as getLocalFavoriteIds,
  toggleFavorite as toggleLocalFavorite,
  getRecent as getLocalRecent,
  saveRecent as saveLocalRecent,
  getRelatedExercises as getLocalRelatedExercises,
  invalidateExerciseCache,
  preloadExercises,
} from "./ExerciseService";

// Wger API Service
export * from "./WgerApiService";

// Unified Exercise Service (main public API - combines local + wger)
export * from "./UnifiedExerciseService";

// ID Mapping (re-export from shared)
export * from "../../../shared/lib/IdMap";

/* Re-export types */
export type { Exercise } from "../../../types/Exercise";
export type { ExerciseSearchOptions } from "./ExerciseService";