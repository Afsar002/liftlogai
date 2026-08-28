/* ------------------------------------------------------------------ */
/* Wger unit resolution                                                */
/* ------------------------------------------------------------------ */
/* wger stores weight units as an integer FK to its `unit` table.
 * Historically callers hardcoded (kg = 1, lb = 2). Those IDs are not
 * part of a stable public contract, so we resolve them from the same
 * unauthenticated `unit` endpoint the rest of the wger client uses,
 * and cache the mapping in localStorage (mirrors the existing per-feature
 * cache pattern). When a match can't be resolved we return `null` so the
 * caller can fall back gracefully instead of guessing.
 */

export interface WgerUnit {
  id: number;
  name: string;
}

export interface WgerPaginatedUnitResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const WGER_BASE_URL = "https://wger.de/api/v2";
export const UNITS_CACHE_KEY = "liftlog_wger_units";
const UNITS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedUnits {
  timestamp: number;
  units: WgerUnit[];
}

function readUnitsCache(): CachedUnits | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(UNITS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedUnits;
    if (Date.now() - parsed.timestamp > UNITS_CACHE_TTL_MS) {
      localStorage.removeItem(UNITS_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeUnitsCache(units: WgerUnit[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(UNITS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), units }));
  } catch {
    // Ignore quota errors
  }
}

/** Fetches the full unit list once and returns the resolved units array. */
export async function ensureUnits(accessToken?: string, forceRefresh = false): Promise<WgerUnit[]> {
  const cached = readUnitsCache();
  if (cached && !forceRefresh) return cached.units;

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (accessToken) headers.Authorization = `Token ${accessToken}`;
    // Higher page_size keeps this to a single request like the other lists.
    const response = await fetch(`${WGER_BASE_URL}/unit/?page_size=200`, { headers });
    if (!response.ok) throw new Error(`wger units error: ${response.status}`);
    const body = (await response.json()) as WgerPaginatedUnitResponse<WgerUnit>;
    const units = body.results ?? [];
    writeUnitsCache(units);
    return units;
  } catch (error) {
    console.error("[wgerUnits] Failed to fetch units:", error);
    return cached?.units ?? [];
  }
}

/**
 * Resolves a unit name (case-insensitive) to its wger unit ID.
 * Returns null when no match is found so callers can fall back.
 */
export async function getWgerUnitIdByName(
  unitName: string,
  accessToken?: string
): Promise<number | null> {
  const units = await ensureUnits(accessToken);
  const needle = unitName.trim().toLowerCase();
  const match = units.find((u) => u.name.trim().toLowerCase() === needle);
  // Also accept common aliases ("gram" → "g").
  if (!match && needle === "gram") {
    return units.find((u) => u.name.trim().toLowerCase() === "g")?.id ?? null;
  }
  return match?.id ?? null;
}

/** Convenience: resolve the canonical kg unit ID. */
export function getWgerKgUnitId(accessToken?: string): Promise<number | null> {
  return getWgerUnitIdByName("kg", accessToken);
}