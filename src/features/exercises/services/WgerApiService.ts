import type {
  BodyRegion,
  Exercise,
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEquipment,
  ExerciseForce,
  ExerciseMechanic,
  Muscle,
} from "../../../types/Exercise";
import { createIdMap } from "../../../shared/lib/IdMap";
import { WgerApiClient } from "../../../shared/lib/WgerApiClient";
import { mapCategory, mapEquipment, mapMuscle, determineBodyRegion } from "../../../shared/lib/loadWgerMaps";

const exerciseIdMap = createIdMap<number>("exercise");

/* ------------------------------------------------------------------ */
/* wger API types (minimal subset we need)                            */
/* ------------------------------------------------------------------ */

interface WgerExerciseInfo {
  id: number;
  uuid: string;
  category: { id: number; name: string };
  muscles: Array<{ id: number; name: string }>;
  muscles_secondary: Array<{ id: number; name: string }>;
  equipment: Array<{ id: number; name: string }>;
  license: { id: number; name: string; is_builtin: boolean };
  license_author: string;
  images: Array<{ id: number; image: string; is_main: boolean; license: number; license_author: string }>;
  translations: Array<{
    id: number;
    language: number;
    name: string;
    description: string;
    creation_date: string;
    uuid: string;
  }>;
  videos: Array<{ id: number; uuid: string; video: string; is_main: boolean; size?: number; duration?: string; width?: number; height?: number; codec?: string }>;
  variation_group: number | null;
}

interface WgerMuscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
  image_url_main: string;
  image_url_secondary: string;
}

interface WgerEquipment {
  id: number;
  name: string;
}

interface WgerExerciseCategory {
  id: number;
  name: string;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const DEFAULT_LANGUAGE = 2; // English
const CACHE_KEY = "liftlog_wger_exercises";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ------------------------------------------------------------------ */
/* Wger API Client                                                    */
/* ------------------------------------------------------------------ */

const wgerClient = new WgerApiClient<WgerExerciseInfo, WgerExerciseInfo[]>({
  cacheKey: CACHE_KEY,
  cacheTtlMs: CACHE_TTL_MS,
});

/* ------------------------------------------------------------------ */
/* Cache helpers (delegated to client)                                */
/* ------------------------------------------------------------------ */

function readCache(): { exercises: Exercise[]; timestamp: number } | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { exercises: Exercise[]; timestamp: number };
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(exercises: Exercise[]): void {
  // This is kept for backward compatibility - the client handles caching
  // but we need to write our transformed exercises, not raw API data
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), exercises }));
  } catch {
    // Ignore quota errors
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Fetches all exercises from wger API, transforms to our Exercise type,
 * and caches the result locally. Uses cached data if fresh.
 */
export async function fetchWgerExercises(forceRefresh = false): Promise<Exercise[]> {
  // Check cache first
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) return cached.exercises;
  }

  try {
    // Fetch reference data in parallel using client
    const [muscles, equipment, categories] = await Promise.all([
      wgerClient.fetchAllPages<WgerMuscle>(`${wgerClient.config.baseUrl}/muscle/?limit=100`),
      wgerClient.fetchAllPages<WgerEquipment>(`${wgerClient.config.baseUrl}/equipment/?limit=100`),
      wgerClient.fetchAllPages<WgerExerciseCategory>(`${wgerClient.config.baseUrl}/exercisecategory/?limit=50`),
    ]);

    // Build lookup maps - use name_en when available, fall back to name for muscles without name_en
    const muscleMap = new Map(muscles.map(m => [m.id, m.name_en || m.name]));
    const equipmentMap = new Map(equipment.map(e => [e.id, e.name]));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Fetch exercise info (detailed data with translations, images, videos)
    const exerciseInfos = await wgerClient.fetchAllPages<WgerExerciseInfo>(
      `${wgerClient.config.baseUrl}/exerciseinfo/?limit=100&language=${DEFAULT_LANGUAGE}`
    );

    // Transform to our Exercise type
    const exercises = exerciseInfos
      .filter(info => info.translations.some(t => t.language === DEFAULT_LANGUAGE && t.name.trim()))
      .map(info => transformWgerExercise(info, muscleMap, equipmentMap, categoryMap))
      .filter((ex): ex is Exercise => ex !== null);

    // Build ID mapping with numeric wger IDs for cross-device deduplication
    exerciseIdMap.buildMappingFromItems(exerciseInfos, info => info.uuid, info => info.id, info => {
      const t = info.translations.find(x => x.language === DEFAULT_LANGUAGE);
      return t?.name?.trim() ?? `Exercise ${info.id}`;
    });

    // Cache and return
    writeCache(exercises);
    return exercises;
  } catch (error) {
    console.error("[WgerApiService] Failed to fetch exercises:", error);
    // Return cached data even if stale as fallback
    const cached = readCache();
    if (cached) return cached.exercises;
    throw error;
  }
}

/**
 * Transforms a single wger ExerciseInfo to our canonical Exercise type.
 * Returns null if the exercise cannot be mapped (e.g., missing English name).
 */
function transformWgerExercise(
  info: WgerExerciseInfo,
  muscleMap: Map<number, string>,
  equipmentMap: Map<number, string>,
  categoryMap: Map<number, string>
): Exercise | null {
  // Get English translation
  const translation = info.translations.find(t => t.language === DEFAULT_LANGUAGE);
  if (!translation?.name?.trim()) return null;

  // Map primary muscles using shared mapping
  const primaryMuscles: Muscle[] = info.muscles
    .map(m => {
      const wgerName = muscleMap.get(m.id);
      if (!wgerName) return null;
      return mapMuscle(wgerName);
    })
    .filter((m): m is Muscle => Boolean(m));

  // Map secondary muscles
  const secondaryMuscles: Muscle[] = info.muscles_secondary
    .map(m => {
      const wgerName = muscleMap.get(m.id);
      if (!wgerName) return null;
      return mapMuscle(wgerName);
    })
    .filter((m): m is Muscle => Boolean(m));

  // Map equipment (take first)
  const firstEquipmentName = info.equipment[0] ? equipmentMap.get(info.equipment[0].id) : null;
  const equipment = firstEquipmentName ? mapEquipment(firstEquipmentName) : "None";

  // Map category
  const category = info.category ? mapCategory(info.category.id) ?? "Strength" : "Strength";

  // Determine body region from primary muscles (they're already canonical Muscle names)
  const bodyRegion = determineBodyRegion(primaryMuscles as string[]) as BodyRegion;

  // Get main image thumbnail URL (wger API returns full URLs)
  const mainImage = info.images.find(img => img.is_main);
  const thumbnail = mainImage ? mainImage.image : null;

  // Build instructions from description (if available)
  const instructions = translation.description
    ? translation.description
        .replace(/<[^>]*>/g, "") // Strip HTML
        .split(/\n+/)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  // Generate deterministic ID from wger UUID
  const id = `wger-${info.uuid}`;

  return {
    id,
    name: translation.name.trim(),
    aliases: [translation.name.trim(), ...info.translations
      .filter(t => t.language !== DEFAULT_LANGUAGE && t.name.trim())
      .map(t => t.name.trim())
    ],
    category,
    equipment,
    primaryMuscles: primaryMuscles.length > 0 ? primaryMuscles : ["Chest"],
    secondaryMuscles,
    difficulty: "Intermediate", // wger doesn't expose difficulty; default
    mechanic: "Compound", // wger doesn't expose mechanic; default
    force: null,
    instructions,
    tips: [],
    image: thumbnail,
    thumbnail,
    gif: null,
    video: info.videos.length > 0 ? info.videos[0].video : null,
    bodyRegion,
  };
}

/**
 * Invalidates the local wger cache (forces refetch on next call).
 */
export function invalidateWgerCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Checks if cached wger data exists and is fresh.
 */
export function hasFreshWgerCache(): boolean {
  const cached = readCache();
  return cached !== null;
}

/**
 * Gets the count of cached wger exercises without loading them.
 */
export function getCachedWgerCount(): number {
  const cached = readCache();
  return cached?.exercises.length ?? 0;
}