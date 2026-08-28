/* ------------------------------------------------------------------ */
/* Exercise ID Mapping Service                                        */
/* ------------------------------------------------------------------ */
/* Provides bidirectional mapping between wger exercise IDs and       */
/* local Exercise IDs. Uses deterministic UUID-based IDs for          */
/* cross-device deduplication.                                        */
/* ------------------------------------------------------------------ */

import type { Exercise } from "../../../types/Exercise";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface WgerExerciseMapping {
  /** wger exerciseinfo numeric ID */
  wgerId: number;
  /** wger exerciseinfo UUID (stable across wger instances) */
  wgerUuid: string;
  /** Our local deterministic ID (wger-{uuid}) */
  localId: string;
  /** Exercise name for debugging/display */
  name: string;
  /** When this mapping was created */
  createdAt: number;
}

interface ExerciseIdMapState {
  version: number;
  updatedAt: number;
  mappings: WgerExerciseMapping[];
}

const STORAGE_KEY = "liftlog_exercise_id_map";
const MAP_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Storage helpers                                                    */
/* ------------------------------------------------------------------ */

function readMap(): ExerciseIdMapState | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExerciseIdMapState;
    if (parsed.version !== MAP_VERSION) {
      // Version mismatch - clear and rebuild
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeMap(state: ExerciseIdMapState): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

/* ------------------------------------------------------------------ */
/* Core mapping logic                                                 */
/* ------------------------------------------------------------------ */

/** Generates our deterministic local ID from wger UUID. */
export function generateLocalId(wgerUuid: string): string {
  return `wger-${wgerUuid}`;
}

/** Extracts wger UUID from our local ID. */
export function extractWgerUuid(localId: string): string | null {
  if (!localId.startsWith("wger-")) return null;
  return localId.slice(5);
}

/** Checks if an ID is a wger-mapped ID. */
export function isWgerMappedId(id: string): boolean {
  return id.startsWith("wger-");
}

/**
 * Builds/updates the mapping table from a list of exercises.
 * Call this after loading exercises from wger API.
 */
export function buildMappingFromExercises(exercises: Exercise[]): void {
  const existing = readMap();
  const mappings = existing?.mappings ?? [];
  const existingByUuid = new Map(mappings.map(m => [m.wgerUuid, m]));
  let updated = false;

  for (const ex of exercises) {
    if (!isWgerMappedId(ex.id)) continue;
    const wgerUuid = extractWgerUuid(ex.id);
    if (!wgerUuid) continue;

    // Try to extract numeric wger ID from name or other metadata
    // Since we only have UUID in our ID, we'll store what we have
    const existing = existingByUuid.get(wgerUuid);
    if (!existing) {
      mappings.push({
        wgerId: 0, // Not available from our Exercise type
        wgerUuid,
        localId: ex.id,
        name: ex.name,
        createdAt: Date.now(),
      });
      updated = true;
    } else if (existing.name !== ex.name) {
      // Update name if changed
      existing.name = ex.name;
      updated = true;
    }
  }

  if (updated) {
    writeMap({
      version: MAP_VERSION,
      updatedAt: Date.now(),
      mappings,
    });
  }
}

/**
 * Gets the local Exercise ID for a wger UUID.
 */
export function getLocalIdByWgerUuid(wgerUuid: string): string | null {
  const map = readMap();
  if (!map) return null;
  const mapping = map.mappings.find(m => m.wgerUuid === wgerUuid);
  return mapping?.localId ?? null;
}

/**
 * Gets the wger UUID for a local Exercise ID.
 */
export function getWgerUuidByLocalId(localId: string): string | null {
  if (!isWgerMappedId(localId)) return null;
  return extractWgerUuid(localId);
}

/**
 * Gets the wger numeric ID for a local Exercise ID (if available).
 */
export function getWgerIdByLocalId(localId: string): number | null {
  const map = readMap();
  if (!map) return null;
  const mapping = map.mappings.find(m => m.localId === localId);
  return mapping?.wgerId ?? null;
}

/**
 * Gets the wger numeric ID for a wger UUID (if available).
 */
export function getWgerIdByWgerUuid(wgerUuid: string): number | null {
  const map = readMap();
  if (!map) return null;
  const mapping = map.mappings.find(m => m.wgerUuid === wgerUuid);
  return mapping?.wgerId ?? null;
}

/**
 * Sets the wger numeric ID for a mapping (call when you have it from API).
 */
export function setWgerIdForUuid(wgerUuid: string, wgerId: number): void {
  const map = readMap();
  if (!map) return;
  const mapping = map.mappings.find(m => m.wgerUuid === wgerUuid);
  if (mapping) {
    mapping.wgerId = wgerId;
    writeMap(map);
  }
}

/**
 * Gets all mappings.
 */
export function getAllMappings(): WgerExerciseMapping[] {
  const map = readMap();
  return map?.mappings ?? [];
}

/**
 * Gets mapping count.
 */
export function getMappingCount(): number {
  const map = readMap();
  return map?.mappings.length ?? 0;
}

/**
 * Clears the mapping table.
 */
export function clearMapping(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { }
}

/**
 * Checks if mapping exists and is fresh (less than 7 days old).
 */
export function hasFreshMapping(maxAgeMs = 7 * 24 * 60 * 60 * 1000): boolean {
  const map = readMap();
  if (!map || map.mappings.length === 0) return false;
  return Date.now() - map.updatedAt < maxAgeMs;
}

/* ------------------------------------------------------------------ */
/* Search helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Finds exercises by partial name match using the mapping table.
 * Useful for linking local custom exercises to wger exercises.
 */
export function findMappingsByName(query: string): WgerExerciseMapping[] {
  const map = readMap();
  if (!map) return [];
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  return map.mappings.filter(m => m.name.toLowerCase().includes(lowerQuery));
}

/**
 * Resolves a wger numeric ID to local ID.
 * Useful when wger API returns numeric IDs (e.g., in workout templates).
 */
export async function resolveWgerIdToLocalId(wgerId: number): Promise<string | null> {
  // We'd need to fetch the exercise from wger to get its UUID
  // This is a placeholder for when we have the full exercise data
  const map = readMap();
  if (!map) return null;
  const mapping = map.mappings.find(m => m.wgerId === wgerId);
  return mapping?.localId ?? null;
}

/**
 * Batch resolves wger numeric IDs to local IDs.
 */
export async function resolveWgerIdsToLocalIds(wgerIds: number[]): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const map = readMap();
  if (!map) return result;

  for (const wgerId of wgerIds) {
    const mapping = map.mappings.find(m => m.wgerId === wgerId);
    if (mapping) {
      result.set(wgerId, mapping.localId);
    }
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Facade export                                                      */
/* ------------------------------------------------------------------ */

export const ExerciseIdMap = {
  generateLocalId,
  extractWgerUuid,
  isWgerMappedId,
  buildMappingFromExercises,
  getLocalIdByWgerUuid,
  getWgerUuidByLocalId,
  getWgerIdByLocalId,
  getWgerIdByWgerUuid,
  setWgerIdForUuid,
  getAllMappings,
  getMappingCount,
  clearMapping,
  hasFreshMapping,
  findMappingsByName,
  resolveWgerIdToLocalId,
  resolveWgerIdsToLocalIds,
};