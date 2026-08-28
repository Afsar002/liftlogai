import type {
  WorkoutTemplateDB,
  TemplateExercise,
} from "../../../database/types";

/* ------------------------------------------------------------------ */
/* wger API types (minimal subset we need)                            */
/* ------------------------------------------------------------------ */

interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface WgerPublicTemplate {
  id: number;
  uuid: string;
  name: string;
  description: string;
  created: string;
  last_update: string;
  owner: number;
  owner_username: string;
  is_public: boolean;
  license: number;
  days: WgerTemplateDay[];
}

interface WgerTemplateDay {
  id: number;
  uuid: string;
  order: number;
  routine: number;
  exercises: WgerTemplateExercise[];
}

interface WgerTemplateExercise {
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
  sets: number;
  reps: string; // e.g., "8-12" or "5"
  rest_time: number; // seconds
  weight: number;
  weight_unit: string; // "kg" or "lb"
  rir: number | null;
  note: string;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const WGER_BASE_URL = "https://wger.de/api/v2";
const DEFAULT_LANGUAGE = 2; // English
const CACHE_KEY = "liftlog_wger_templates";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/* ------------------------------------------------------------------ */
/* Cache helpers                                                      */
/* ------------------------------------------------------------------ */

interface CachedTemplateData {
  timestamp: number;
  templates: WgerTemplate[];
}

export interface WgerTemplate {
  id: string; // deterministic from uuid
  name: string;
  description: string;
  source: "wger-public" | "wger-user";
  wgerRoutineId: number;
  wgerRoutineUuid: string;
  exercises: WgerTemplateExercise[];
  dayCount: number;
  totalExercises: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

function readCache(): CachedTemplateData | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedTemplateData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(templates: WgerTemplate[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), templates }));
  } catch {
    // Ignore quota errors
  }
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                       */
/* ------------------------------------------------------------------ */

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en",
    },
  });
  if (!response.ok) {
    throw new Error(`wger API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function fetchAllPages<T>(initialUrl: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = initialUrl;
  while (url) {
    const response: WgerPaginatedResponse<T> = await fetchJson<WgerPaginatedResponse<T>>(url);
    results.push(...response.results);
    url = response.next;
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* Transform helpers                                                  */
/* ------------------------------------------------------------------ */

function transformPublicTemplate(api: WgerPublicTemplate): WgerTemplate {
  const allExercises = api.days.flatMap((day) => day.exercises);
  return {
    id: `wger-template-${api.uuid}`,
    name: api.name,
    description: api.description,
    source: "wger-public",
    wgerRoutineId: api.id,
    wgerRoutineUuid: api.uuid,
    exercises: allExercises,
    dayCount: api.days.length,
    totalExercises: allExercises.length,
    author: api.owner_username,
    createdAt: api.created,
    updatedAt: api.last_update,
  };
}

export function getEnglishName(exercise: WgerTemplateExercise["exercise_detail"]): string {
  const translation = exercise.translations.find((t) => t.language === DEFAULT_LANGUAGE);
  return translation?.name?.trim() ?? `Exercise ${exercise.id}`;
}

export function parseReps(repsString: string): string {
  // wger uses strings like "8-12", "5", "10-15"
  return repsString.trim();
}

export function parseRest(restTime: number): number {
  // wger returns seconds
  return restTime;
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Fetches all public workout templates from wger.
 * Uses cached data if fresh, otherwise fetches from API.
 */
export async function fetchPublicTemplates(forceRefresh = false): Promise<WgerTemplate[]> {
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) return cached.templates;
  }

  try {
    const routines = await fetchAllPages<WgerPublicTemplate>(
      `${WGER_BASE_URL}/public-templates/?limit=100`
    );

    const templates = routines.map(transformPublicTemplate);
    writeCache(templates);
    return templates;
  } catch (error) {
    console.error("[WgerTemplateService] Failed to fetch public templates:", error);
    // Return cached data even if stale as fallback
    const cached = readCache();
    if (cached) return cached.templates;
    throw error;
  }
}

/**
 * Fetches a single template by UUID with full detail (days, exercises, sets).
 */
export async function fetchTemplateById(uuid: string): Promise<WgerTemplate | null> {
  try {
    const routine: WgerPublicTemplate = await fetchJson(
      `${WGER_BASE_URL}/templates/${uuid}/`
    );
    return transformPublicTemplate(routine);
  } catch (error) {
    console.error("[WgerTemplateService] Failed to fetch template:", error);
    return null;
  }
}

/**
 * Converts a wger template to our local WorkoutTemplateDB format.
 * Requires exercise ID mapping from wger exerciseinfo ID -> our Exercise.id
 */
export async function convertToLocalTemplate(
  wgerTemplate: WgerTemplate,
  exerciseIdMap: Map<number, string> // wger exerciseinfo.id -> local Exercise.id
): Promise<Omit<WorkoutTemplateDB, "id" | "createdAt" | "updatedAt">> {
  // This needs day structure - we'll enhance transformPublicTemplate to preserve days
  // For now, return flat structure
  return {
    name: wgerTemplate.name,
    exercises: wgerTemplate.exercises
      .filter((ex) => exerciseIdMap.has(ex.exercise))
      .map((ex, index) => ({
        id: crypto.randomUUID(),
        name: getEnglishName(ex.exercise_detail),
        targetSets: ex.sets,
        targetReps: parseReps(ex.reps),
        rest: parseRest(ex.rest_time),
      })),
  };
}

/**
 * Invalidates the local wger template cache (forces refetch on next call).
 */
export function invalidateWgerTemplateCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Checks if cached wger template data exists and is fresh.
 */
export function hasFreshWgerTemplateCache(): boolean {
  const cached = readCache();
  return cached !== null;
}

/**
 * Gets the count of cached wger templates without loading them.
 */
export function getCachedWgerTemplateCount(): number {
  const cached = readCache();
  return cached?.templates.length ?? 0;
}

/**
 * Preloads wger public templates in background.
 */
export function preloadWgerTemplates(): void {
  fetchPublicTemplates().catch(() => {
    // Swallow - best effort
  });
}

/* ------------------------------------------------------------------ */
/* User template sync (requires auth)                                 */
/* ------------------------------------------------------------------ */

/**
 * Fetches user's own templates from wger (requires authentication).
 * Returns null if not authenticated or error.
 */
export async function fetchUserTemplates(accessToken: string): Promise<WgerTemplate[] | null> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/templates/`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Token ${accessToken}`,
      },
    });
    if (!response.ok) return null;

    const data: WgerPaginatedResponse<WgerPublicTemplate> = await response.json();
    return data.results.map(transformPublicTemplate);
  } catch (error) {
    console.error("[WgerTemplateService] Failed to fetch user templates:", error);
    return null;
  }
}

