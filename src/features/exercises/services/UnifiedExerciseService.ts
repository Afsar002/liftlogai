import type {
  BodyRegion,
  Exercise,
  ExerciseCategory,
  ExerciseDataset,
  ExerciseDifficulty,
  ExerciseEquipment,
  ExerciseForce,
  ExerciseMechanic,
  Muscle,
} from "../../../types/Exercise";
import type { ExerciseSearchOptions } from "./ExerciseService";
import { ExerciseLibraryRepository } from "./ExerciseLibraryRepository";
import * as LocalExerciseService from "./ExerciseService";
import * as WgerApiService from "./WgerApiService";
import { createIdMap } from "../../../shared/lib/IdMap";

const exerciseIdMap = createIdMap<number>("exercise");

/* ------------------------------------------------------------------ */
/* Caching                                                             */
/* ------------------------------------------------------------------ */

let unifiedCache: Exercise[] | null = null;
let loadPromise: Promise<Exercise[]> | null = null;

/* ------------------------------------------------------------------ */
/* Deduplication helpers                                               */
/* ------------------------------------------------------------------ */

/** Normalizes an exercise name for comparison (lowercase, trim, remove special chars). */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

/** Checks if two exercises are likely the same (by normalized name). */
function exercisesAreSimilar(a: Exercise, b: Exercise): boolean {
  return normalizeName(a.name) === normalizeName(b.name);
}

/**
 * Merges local and wger exercises, preferring local for duplicates.
 * Local exercises have richer data (instructions, tips, images, gifs).
 * wger exercises supplement the library with additional exercises.
 */
function mergeExercises(local: Exercise[], wger: Exercise[]): Exercise[] {
  const byNormalizedName = new Map<string, Exercise>();

  // First, add all local exercises (they take priority)
  for (const ex of local) {
    byNormalizedName.set(normalizeName(ex.name), ex);
  }

  // Then add wger exercises that don't already exist
  let added = 0;
  for (const ex of wger) {
    const key = normalizeName(ex.name);
    if (!byNormalizedName.has(key)) {
      byNormalizedName.set(key, ex);
      added++;
    }
  }

  if (added > 0) {
    console.log(`[UnifiedExerciseService] Added ${added} exercises from wger`);
  }

  return Array.from(byNormalizedName.values());
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Loads the unified exercise dataset (local + wger).
 * Caches result in memory; subsequent calls resolve instantly.
 * Use `forceRefresh` to bypass both memory and localStorage cache.
 */
export async function loadUnifiedExercises(forceRefresh = false): Promise<Exercise[]> {
  if (unifiedCache && !forceRefresh) return unifiedCache;
  if (loadPromise && !forceRefresh) return loadPromise;

  loadPromise = (async () => {
    // Load both sources in parallel
    const [localExercises, wgerExercises] = await Promise.allSettled([
      LocalExerciseService.loadExercises(),
      WgerApiService.fetchWgerExercises(forceRefresh),
    ]);

    const local = localExercises.status === "fulfilled" ? localExercises.value : [];
    const wger = wgerExercises.status === "fulfilled" ? wgerExercises.value : [];

    if (wgerExercises.status === "rejected") {
      console.warn("[UnifiedExerciseService] Failed to load wger exercises:", wgerExercises.reason);
    }

    unifiedCache = mergeExercises(local, wger);

    // Build ID mapping from wger exercises for cross-device deduplication
    if (wger.length > 0) {
      exerciseIdMap.buildMappingFromItems(wger, ex => ex.id.startsWith("wger-") ? ex.id.slice(5) : null, () => null, ex => ex.name);
    }

    return unifiedCache;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

/** Invalidates all caches (memory + localStorage for wger + local custom exercises). */
export function invalidateUnifiedCache(): void {
  unifiedCache = null;
  loadPromise = null;
  LocalExerciseService.invalidateExerciseCache();
  WgerApiService.invalidateWgerCache();
}

/** Preloads unified exercises in background (non-blocking). */
export function preloadUnifiedExercises(): void {
  loadUnifiedExercises().catch(() => {
    // Swallow - user will hit it on first search
  });
}

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

export async function getAllExercises(): Promise<Exercise[]> {
  return loadUnifiedExercises();
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const all = await loadUnifiedExercises();
  return all.find((exercise) => exercise.id === id);
}

export async function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  if (ids.length === 0) return [];
  const all = await loadUnifiedExercises();
  const byId = new Map(all.map((exercise) => [exercise.id, exercise]));
  const result: Exercise[] = [];
  for (const id of ids) {
    const exercise = byId.get(id);
    if (exercise) result.push(exercise);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

// Re-export search options type
export type { ExerciseSearchOptions };

function exerciseHaystack(exercise: Exercise): string {
  return [
    exercise.name,
    ...exercise.aliases,
    exercise.equipment,
    exercise.category,
    exercise.bodyRegion,
    exercise.primaryMuscles.join(" "),
    exercise.secondaryMuscles.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function matchScore(exercise: Exercise, haystack: string, tokens: string[]): number {
  const name = exercise.name.toLowerCase();
  const all = tokens.join(" ");

  if (name === all) return 100;
  if (name.startsWith(all)) return 90;

  let score = 0;
  for (const token of tokens) {
    if (name === token) {
      score += 80;
    } else if (name.startsWith(token)) {
      score += 70;
    } else if (name.includes(` ${token}`) || name.startsWith(`${token} `)) {
      score += 60;
    } else if (name.includes(token)) {
      score += 45;
    } else if (exercise.aliases.some((alias) => alias.includes(token))) {
      score += 25;
    } else if (
      exercise.primaryMuscles.some((m) => m.toLowerCase().includes(token)) ||
      exercise.equipment.toLowerCase().includes(token) ||
      exercise.category.toLowerCase().includes(token) ||
      exercise.bodyRegion.toLowerCase().includes(token)
    ) {
      score += 8;
    }
  }
  return score;
}

function matchesFilters(exercise: Exercise, options: ExerciseSearchOptions): boolean {
  if (options.equipment && options.equipment.length > 0 && !options.equipment.includes(exercise.equipment)) {
    return false;
  }
  if (options.muscles && options.muscles.length > 0) {
    const has = [...exercise.primaryMuscles, ...exercise.secondaryMuscles].some((m) =>
      options.muscles!.includes(m)
    );
    if (!has) return false;
  }
  if (options.category && options.category.length > 0 && !options.category.includes(exercise.category)) {
    return false;
  }
  if (options.difficulty && options.difficulty.length > 0 && !options.difficulty.includes(exercise.difficulty)) {
    return false;
  }
  if (options.force && options.force.length > 0) {
    if (!exercise.force || !options.force.includes(exercise.force)) return false;
  }
  if (options.mechanic && options.mechanic.length > 0) {
    if (!exercise.mechanic || !options.mechanic.includes(exercise.mechanic)) return false;
  }
  if (options.bodyRegion && options.bodyRegion.length > 0 && !options.bodyRegion.includes(exercise.bodyRegion)) {
    return false;
  }
  return true;
}

/**
 * Unified search across local + wger exercises.
 */
export async function searchExercises(
  query: string,
  options: ExerciseSearchOptions = {}
): Promise<Exercise[]> {
  const all = await loadUnifiedExercises();
  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const filtered = all.filter((exercise) => matchesFilters(exercise, options));

  if (tokens.length === 0) return filtered;

  return filtered
    .map((exercise) => {
      const haystack = exerciseHaystack(exercise);
      const hit = tokens.every((token) => haystack.includes(token));
      if (!hit) return null;
      return { exercise, score: matchScore(exercise, haystack, tokens) };
    })
    .filter((entry): entry is { exercise: Exercise; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
    .map((entry) => entry.exercise);
}

/* ------------------------------------------------------------------ */
/* Convenience filter helpers                                          */
/* ------------------------------------------------------------------ */

export async function getByEquipment(equipment: ExerciseEquipment): Promise<Exercise[]> {
  return searchExercises("", { equipment: [equipment] });
}

export async function getByMuscle(muscle: Muscle): Promise<Exercise[]> {
  return searchExercises("", { muscles: [muscle] });
}

export async function getByCategory(category: ExerciseCategory): Promise<Exercise[]> {
  return searchExercises("", { category: [category] });
}

export async function getByDifficulty(difficulty: ExerciseDifficulty): Promise<Exercise[]> {
  return searchExercises("", { difficulty: [difficulty] });
}

/** Distinct values for each filter dimension (for building filter UIs). */
export async function getFilterOptions(): Promise<{
  equipment: ExerciseEquipment[];
  muscles: Muscle[];
  category: ExerciseCategory[];
  difficulty: ExerciseDifficulty[];
  force: ExerciseForce[];
  mechanic: ExerciseMechanic[];
  bodyRegion: BodyRegion[];
}> {
  const all = await loadUnifiedExercises();
  const distinct = <T,>(values: T[]): T[] => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));

  return {
    equipment: distinct(all.map((e) => e.equipment)),
    muscles: distinct(all.flatMap((e) => [...e.primaryMuscles, ...e.secondaryMuscles])),
    category: distinct(all.map((e) => e.category)),
    difficulty: distinct(all.map((e) => e.difficulty)),
    force: distinct(all.map((e) => e.force).filter((f): f is ExerciseForce => f !== null)),
    mechanic: distinct(all.map((e) => e.mechanic).filter((m): m is ExerciseMechanic => m !== null)),
    bodyRegion: distinct(all.map((e) => e.bodyRegion)),
  };
}

/* ------------------------------------------------------------------ */
/* Favorites (delegates to local service)                              */
/* ------------------------------------------------------------------ */

export async function getFavorites(): Promise<Exercise[]> {
  return LocalExerciseService.getFavorites();
}

export async function getFavoriteIds(): Promise<string[]> {
  return LocalExerciseService.getFavoriteIds();
}

export async function toggleFavorite(id: string): Promise<boolean> {
  return LocalExerciseService.toggleFavorite(id);
}

/* ------------------------------------------------------------------ */
/* Recent (delegates to local service)                                 */
/* ------------------------------------------------------------------ */

export async function getRecent(): Promise<Exercise[]> {
  return LocalExerciseService.getRecent();
}

export async function saveRecent(id: string): Promise<void> {
  return LocalExerciseService.saveRecent(id);
}

/* ------------------------------------------------------------------ */
/* Related exercises                                                   */
/* ------------------------------------------------------------------ */

function muscleRegion(muscle: Muscle | undefined): BodyRegion {
  if (!muscle) return "Full Body";
  if (muscle === "Chest") return "Chest";
  if (["Back", "Lats", "Lower Back", "Middle Back", "Traps", "Neck"].includes(muscle)) return "Back";
  if (["Shoulders", "Biceps", "Triceps", "Forearms"].includes(muscle)) return "Upper Body";
  if (["Quadriceps", "Hamstrings", "Glutes", "Calves", "Abductors", "Adductors"].includes(muscle)) return "Lower Body";
  return "Core";
}

export async function getRelatedExercises(id: string, limit = 8): Promise<Exercise[]> {
  const all = await loadUnifiedExercises();
  const source = all.find((exercise) => exercise.id === id);
  if (!source) return [];

  const scored = all
    .filter((exercise) => exercise.id !== id)
    .map((exercise) => {
      let score = 0;

      const sharedPrimary = exercise.primaryMuscles.filter((m) =>
        source.primaryMuscles.includes(m)
      ).length;
      score += sharedPrimary * 3;

      if (exercise.bodyRegion === source.bodyRegion) score += 1;

      const sharedSecondary = exercise.secondaryMuscles.filter((m) =>
        source.secondaryMuscles.includes(m)
      ).length;
      score += sharedSecondary;

      if (exercise.equipment === source.equipment) score += 2;
      if (exercise.difficulty === source.difficulty) score += 1;

      if (exercise.force && exercise.force === source.force) score += 1;
      if (exercise.mechanic && exercise.mechanic === source.mechanic) score += 1;
      if (exercise.category === source.category) score += 1;

      return { exercise, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name));

  return scored.slice(0, limit).map((entry) => entry.exercise);
}

/* ------------------------------------------------------------------ */
/* Custom exercise creation (delegates to local repository)            */
/* ------------------------------------------------------------------ */

export async function createCustomExercise(data: {
  name: string;
  muscle?: string;
  equipment?: string;
}): Promise<Exercise> {
  const created = await ExerciseLibraryRepository.create(data);
  invalidateUnifiedCache();
  return LocalExerciseService.mapCustomToExercise(created);
}

/* ------------------------------------------------------------------ */
/* Facade export                                                       */
/* ------------------------------------------------------------------ */

export const UnifiedExerciseService = {
  getAllExercises,
  getExerciseById,
  getExercisesByIds,
  searchExercises,
  getByEquipment,
  getByMuscle,
  getByCategory,
  getByDifficulty,
  getFilterOptions,
  getFavorites,
  getFavoriteIds,
  toggleFavorite,
  getRecent,
  saveRecent,
  getRelatedExercises,
  createCustomExercise,
  invalidateCache: invalidateUnifiedCache,
  preload: preloadUnifiedExercises,
};