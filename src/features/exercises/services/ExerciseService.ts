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
import { ExerciseLibraryRepository } from "./ExerciseLibraryRepository";

/**
 * ExerciseService — the single facade for the offline Exercise Library.
 *
 * Responsibilities:
 *   - Loads the bundled dataset (code-split, cached after first load) and
 *     merges it with custom exercises persisted in Dexie.
 *   - Provides typed query methods (search, filters, related, favorites,
 *     recent) with no runtime API dependency.
 *
 * Favorites and recent exercises are persisted to localStorage under the
 * `liftlog_` prefix, matching the convention used elsewhere in the app.
 */

const FAVORITES_KEY = "liftlog_exercise_favorites";
const RECENT_KEY = "liftlog_exercise_recent";
const RECENT_LIMIT = 20;

/* ------------------------------------------------------------------ */
/* Caching                                                             */
/* ------------------------------------------------------------------ */

let cached: Exercise[] | null = null;
let loadPromise: Promise<Exercise[]> | null = null;

function readStoredIds(key: string): string[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key: string, ids: string[]) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Graceful fallback if storage is unavailable or quota exceeded.
  }
}

/**
 * Maps a user-created custom exercise (ExerciseDB) to the canonical Exercise
 * shape, filling sensible defaults for the fields custom entries don't set.
 */
export function mapCustomToExercise(custom: {
  id: string;
  name: string;
  muscle?: string;
  equipment?: string;
}): Exercise {
  const muscles: Muscle[] = (custom.muscle ?? "Other")
    .split("/")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .filter((m): m is Muscle => muscleSet.has(m as Muscle));

  const equipment = equipmentSet.has(custom.equipment as ExerciseEquipment)
    ? (custom.equipment as ExerciseEquipment)
    : "Other";

  return {
    id: custom.id,
    name: custom.name,
    aliases: [],
    category: "Strength",
    equipment,
    primaryMuscles: muscles.length > 0 ? muscles : ["Chest"],
    secondaryMuscles: [],
    difficulty: "Beginner",
    mechanic: "Compound",
    force: null,
    instructions: [],
    tips: ["This is a custom exercise created in LiftLogAI."],
    image: null,
    thumbnail: null,
    gif: null,
    video: null,
    bodyRegion: muscleRegion(muscles[0] ?? "Chest"),
  };
}

/**
 * Loads the dataset lazily (dynamic import -> code-split chunk) and merges
 * custom exercises. The result is cached; subsequent calls resolve instantly.
 */
export async function loadExercises(): Promise<Exercise[]> {
  if (cached) return cached;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const module = await import("../../../data/exercises.json");
    const dataset = module.default as unknown as ExerciseDataset;
    const builtins = dataset.exercises;
    const custom = await ExerciseLibraryRepository.getCustom();
    cached = [...builtins, ...custom.map(mapCustomToExercise)];
    return cached;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

/** Drops the in-memory cache (called after a custom exercise is created). */
export function invalidateExerciseCache() {
  cached = null;
  loadPromise = null;
}

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

export async function getAllExercises(): Promise<Exercise[]> {
  return loadExercises();
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const all = await loadExercises();
  return all.find((exercise) => exercise.id === id);
}

export async function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  if (ids.length === 0) return [];
  const all = await loadExercises();
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

export interface ExerciseSearchOptions {
  /** Filter by equipment (multiple allowed). */
  equipment?: ExerciseEquipment[];
  /** Filter by any of these muscles (primary or secondary). */
  muscles?: Muscle[];
  /** Filter by category (multiple allowed). */
  category?: ExerciseCategory[];
  /** Filter by difficulty (multiple allowed). */
  difficulty?: ExerciseDifficulty[];
  /** Filter by force (multiple allowed). */
  force?: ExerciseForce[];
  /** Filter by mechanic (multiple allowed). */
  mechanic?: ExerciseMechanic[];
  /** Filter by body region (multiple allowed). */
  bodyRegion?: BodyRegion[];
}

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

/** Rank 0..100 so a fully-matching name beats an alias hit beats a metadata hit. */
function matchScore(exercise: Exercise, haystack: string, tokens: string[]): number {
  const name = exercise.name.toLowerCase();
  const all = tokens.join(" ");

  if (name === all) return 100;
  if (name.startsWith(all)) return 90;

  let score = 0;
  for (const token of tokens) {
    if (name.includes(token)) score += 40;
    else if (exercise.aliases.some((alias) => alias.includes(token))) score += 25;
    else if (
      exercise.primaryMuscles.some((m) => m.toLowerCase().includes(token)) ||
      exercise.equipment.toLowerCase().includes(token) ||
      exercise.category.toLowerCase().includes(token) ||
      exercise.bodyRegion.toLowerCase().includes(token)
    ) {
      score += 10;
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
 * Debounce-friendly search: tokenized, case-insensitive, fuzzy over name,
 * aliases, equipment, muscles, and category. Empty query + no filters returns
 * the full list. Result set is already cached, so repeated calls are cheap.
 */
export async function searchExercises(
  query: string,
  options: ExerciseSearchOptions = {}
): Promise<Exercise[]> {
  const all = await loadExercises();
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
  const all = await loadExercises();
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
/* Favorites                                                           */
/* ------------------------------------------------------------------ */

export async function getFavorites(): Promise<Exercise[]> {
  const ids = readStoredIds(FAVORITES_KEY);
  return getExercisesByIds(ids);
}

export async function getFavoriteIds(): Promise<string[]> {
  return readStoredIds(FAVORITES_KEY);
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const ids = readStoredIds(FAVORITES_KEY);
  const index = ids.indexOf(id);
  let next: string[];
  let nowFavorite: boolean;

  if (index >= 0) {
    next = ids.filter((existing) => existing !== id);
    nowFavorite = false;
  } else {
    next = [id, ...ids];
    nowFavorite = true;
  }

  writeStoredIds(FAVORITES_KEY, next);
  return nowFavorite;
}

/* ------------------------------------------------------------------ */
/* Recent                                                              */
/* ------------------------------------------------------------------ */

export async function getRecent(): Promise<Exercise[]> {
  const ids = readStoredIds(RECENT_KEY);
  return getExercisesByIds(ids);
}

/** Records an exercise as recently viewed (most-recent first, capped). */
export async function saveRecent(id: string): Promise<void> {
  const ids = readStoredIds(RECENT_KEY).filter((existing) => existing !== id);
  writeStoredIds(RECENT_KEY, [id, ...ids].slice(0, RECENT_LIMIT));
}

/* ------------------------------------------------------------------ */
/* Related                                                             */
/* ------------------------------------------------------------------ */

function muscleRegion(muscle: Muscle | undefined): BodyRegion {
  if (!muscle) return "Full Body";
  if (muscle === "Chest") return "Chest";
  if (["Back", "Lats", "Lower Back", "Middle Back", "Traps", "Neck"].includes(muscle)) return "Back";
  if (["Shoulders", "Biceps", "Triceps", "Forearms"].includes(muscle)) return "Upper Body";
  if (["Quadriceps", "Hamstrings", "Glutes", "Calves", "Abductors", "Adductors"].includes(muscle)) return "Lower Body";
  return "Core";
}

/**
 * Related exercises ranked by shared primary muscle, equipment, difficulty,
 * and movement pattern (force + mechanic + category).
 */
export async function getRelatedExercises(id: string, limit = 8): Promise<Exercise[]> {
  const all = await loadExercises();
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

      // Movement pattern
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
/* Module-level enum guards                                           */
/* ------------------------------------------------------------------ */

const muscleSet = new Set<Muscle>([
  "Abdominals", "Abductors", "Adductors", "Biceps", "Calves", "Chest",
  "Forearms", "Glutes", "Hamstrings", "Lats", "Lower Back", "Middle Back",
  "Neck", "Quadriceps", "Shoulders", "Traps", "Triceps",
]);

const equipmentSet = new Set<ExerciseEquipment>([
  "Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "EZ Bar",
  "Kettlebell", "Resistance Band", "Exercise Ball", "Medicine Ball",
  "Foam Roll", "Other", "None",
]);

export const ExerciseService = {
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
  invalidateExerciseCache,
};
