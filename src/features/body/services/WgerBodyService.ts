/* ------------------------------------------------------------------ */
/* wger API types (minimal subset we need)                            */
/* ------------------------------------------------------------------ */

interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface WgerWeightEntry {
  id: number;
  uuid: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  weight_unit: {
    id: number;
    name: string; // "kg", "lb", etc.
  } | null;
  created: string;
  last_update: string;
}

interface WgerMeasurementCategory {
  id: number;
  uuid: string;
  name: string;
  unit: string; // "cm", "inch", etc.
  created: string;
  last_update: string;
}

interface WgerMeasurement {
  id: number;
  uuid: string;
  date: string; // YYYY-MM-DD
  category: number; // measurement category ID
  category_detail: WgerMeasurementCategory;
  value: number;
  notes: string;
  created: string;
  last_update: string;
}

interface WgerGallery {
  id: number;
  uuid: string;
  date: string; // YYYY-MM-DD
  image: string; // URL
  description: string;
  created: string;
  last_update: string;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const WGER_BASE_URL = "https://wger.de/api/v2";
const DEFAULT_LANGUAGE = 2; // English

// Cache keys. The account-specific ones (weight / measurements / gallery)
// are scoped per wger account so that switching accounts on this device can
// never surface another account's cached data. Measurement categories are
// global on the wger server, so their key stays unscoped.
const WEIGHT_CACHE_KEY = "liftlog_wger_weight_entries";
const MEASUREMENT_CACHE_KEY = "liftlog_wger_measurements";
const CATEGORY_CACHE_KEY = "liftlog_wger_measurement_categories";
const GALLERY_CACHE_KEY = "liftlog_wger_gallery";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const WGER_USER_STORAGE_KEY = "liftlog_wger_user"; // mirrors WgerAuthService

/** Identity of the wger account currently signed in on this device. */
function getWgerAccountScope(): string {
  try {
    if (typeof window === "undefined" || !window.localStorage) return "anon";
    const raw = localStorage.getItem(WGER_USER_STORAGE_KEY);
    if (!raw) return "anon";
    const user = JSON.parse(raw) as { id?: number; username?: string };
    const identity =
      user.id != null ? `id:${user.id}` : user.username ? `name:${user.username}` : "";
    return identity || "anon";
  } catch {
    return "anon";
  }
}

/** Namespace a cache key with the current wger account ("anon" while signed out). */
function scopeKey(baseKey: string): string {
  return `${baseKey}:${getWgerAccountScope()}`;
}

/* ------------------------------------------------------------------ */
/* Cache helpers                                                      */
/* ------------------------------------------------------------------ */

interface CachedWeightData {
  timestamp: number;
  entries: WgerWeightEntry[];
}

interface CachedMeasurementData {
  timestamp: number;
  measurements: WgerMeasurement[];
  categories: WgerMeasurementCategory[];
}

interface CachedGalleryData {
  timestamp: number;
  photos: WgerGallery[];
}

function readWeightCache(): CachedWeightData | null {
  const key = scopeKey(WEIGHT_CACHE_KEY);
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWeightData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeWeightCache(entries: WgerWeightEntry[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(scopeKey(WEIGHT_CACHE_KEY), JSON.stringify({ timestamp: Date.now(), entries }));
  } catch { }
}

function readMeasurementCache(): CachedMeasurementData | null {
  const key = scopeKey(MEASUREMENT_CACHE_KEY);
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedMeasurementData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeMeasurementCache(
  measurements: WgerMeasurement[],
  categories: WgerMeasurementCategory[]
): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(
      scopeKey(MEASUREMENT_CACHE_KEY),
      JSON.stringify({ timestamp: Date.now(), measurements, categories })
    );
  } catch { }
}

function readGalleryCache(): CachedGalleryData | null {
  const key = scopeKey(GALLERY_CACHE_KEY);
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedGalleryData;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeGalleryCache(photos: WgerGallery[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(scopeKey(GALLERY_CACHE_KEY), JSON.stringify({ timestamp: Date.now(), photos }));
  } catch { }
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                       */
/* ------------------------------------------------------------------ */

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en",
      // Normalize Headers / string[][] instances so caller-supplied headers
      // merge with (and individually override) the defaults instead of
      // replacing the merged object entirely.
      ...(options?.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : options?.headers),
    },
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
/* Public API - Weight Entries                                        */
/* ------------------------------------------------------------------ */

/**
 * Fetches all weight entries for the authenticated user.
 */
export async function fetchWeightEntries(
  accessToken: string,
  forceRefresh = false
): Promise<WgerWeightEntry[]> {
  if (!forceRefresh) {
    const cached = readWeightCache();
    if (cached) return cached.entries;
  }

  try {
    const entries = await fetchAllPages<WgerWeightEntry>(
      `${WGER_BASE_URL}/weightentry/?ordering=-date&limit=100`,
      { headers: { "Authorization": `Token ${accessToken}` } }
    );
    writeWeightCache(entries);
    return entries;
  } catch (error) {
    console.error("[WgerBodyService] Failed to fetch weight entries:", error);
    const cached = readWeightCache();
    if (cached) return cached.entries;
    throw error;
  }
}

/**
 * Creates a new weight entry on wger.
 */
export async function createWeightEntry(
  weight: number,
  date: string, // YYYY-MM-DD
  weightUnitId: number,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/weightentry/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Token ${accessToken}`,
      },
      body: JSON.stringify({
        weight,
        date,
        weight_unit: weightUnitId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[WgerBodyService] Create weight entry failed:", error);
      return null;
    }

    const created = await response.json();
    invalidateWeightCache();
    return created.uuid;
  } catch (error) {
    console.error("[WgerBodyService] Failed to create weight entry:", error);
    return null;
  }
}

/**
 * Fetches weight entries as our local format (partial, without id/createdAt/updatedAt).
 */
export interface LocalWeightEntryPartial {
  date: string;
  weight: number; // in kg
  unit: "kg" | "lb";
}

export function convertWeightEntriesToLocal(
  entries: WgerWeightEntry[],
  targetUnit: "kg" | "lb" = "kg"
): LocalWeightEntryPartial[] {
  const KG_TO_LB = 2.20462;
  const LB_TO_KG = 0.453592;

  return entries
    .map((entry) => {
      let weight = entry.weight;
      const sourceUnit = entry.weight_unit?.name ?? "kg";

      if (sourceUnit === "lb" && targetUnit === "kg") {
        weight = weight * LB_TO_KG;
      } else if (sourceUnit === "kg" && targetUnit === "lb") {
        weight = weight * KG_TO_LB;
      }

      return {
        date: entry.date,
        weight: Math.round(weight * 10) / 10,
        unit: targetUnit,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* ------------------------------------------------------------------ */
/* Public API - Measurement Categories                               */
/* ------------------------------------------------------------------ */

/**
 * Fetches all measurement categories.
 */
export async function fetchMeasurementCategories(
  forceRefresh = false
): Promise<WgerMeasurementCategory[]> {
  if (!forceRefresh) {
    const cached = readMeasurementCache();
    if (cached) return cached.categories;
  }

  try {
    const categories = await fetchAllPages<WgerMeasurementCategory>(
      `${WGER_BASE_URL}/measurement-category/?limit=50`
    );
    // Cache categories alongside measurements
    const existingMeasurements = readMeasurementCache()?.measurements ?? [];
    writeMeasurementCache(existingMeasurements, categories);
    return categories;
  } catch (error) {
    console.error("[WgerBodyService] Failed to fetch measurement categories:", error);
    const cached = readMeasurementCache();
    if (cached) return cached.categories;
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Public API - Measurements                                          */
/* ------------------------------------------------------------------ */

/**
 * Fetches all measurements for the authenticated user.
 */
export async function fetchMeasurements(
  accessToken: string,
  forceRefresh = false
): Promise<{ measurements: WgerMeasurement[]; categories: WgerMeasurementCategory[] }> {
  if (!forceRefresh) {
    const cached = readMeasurementCache();
    if (cached && cached.measurements.length > 0) {
      return { measurements: cached.measurements, categories: cached.categories };
    }
  }

  try {
    const [measurements, categories] = await Promise.all([
      fetchAllPages<WgerMeasurement>(
        `${WGER_BASE_URL}/measurement/?ordering=-date&limit=100`,
        { headers: { "Authorization": `Token ${accessToken}` } }
      ),
      fetchMeasurementCategories(true),
    ]);

    writeMeasurementCache(measurements, categories);
    return { measurements, categories };
  } catch (error) {
    console.error("[WgerBodyService] Failed to fetch measurements:", error);
    const cached = readMeasurementCache();
    if (cached) return { measurements: cached.measurements, categories: cached.categories };
    throw error;
  }
}

/**
 * Creates a new measurement on wger.
 */
export async function createMeasurement(
  categoryId: number,
  value: number,
  date: string, // YYYY-MM-DD
  notes: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${WGER_BASE_URL}/measurement/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Token ${accessToken}`,
      },
      body: JSON.stringify({
        category: categoryId,
        value,
        date,
        notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[WgerBodyService] Create measurement failed:", error);
      return null;
    }

    const created = await response.json();
    invalidateMeasurementCache();
    return created.uuid;
  } catch (error) {
    console.error("[WgerBodyService] Failed to create measurement:", error);
    return null;
  }
}

/**
 * Fetches measurements as our local format grouped by category.
 */
export interface LocalMeasurement {
  categoryId: number;
  categoryName: string;
  unit: string;
  entries: Array<{ date: string; value: number; notes: string }>;
}

export function convertMeasurementsToLocal(
  measurements: WgerMeasurement[],
  categories: WgerMeasurementCategory[]
): LocalMeasurement[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const grouped = new Map<number, Array<{ date: string; value: number; notes: string }>>();

  for (const m of measurements) {
    if (!grouped.has(m.category)) {
      grouped.set(m.category, []);
    }
    grouped.get(m.category)!.push({ date: m.date, value: m.value, notes: m.notes });
  }

  const result: LocalMeasurement[] = [];
  for (const [categoryId, entries] of grouped) {
    const category = categoryMap.get(categoryId);
    if (!category) continue;

    result.push({
      categoryId,
      categoryName: category.name,
      unit: category.unit,
      entries: entries.sort((a, b) => a.date.localeCompare(b.date)),
    });
  }

  return result.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}

/* ------------------------------------------------------------------ */
/* Public API - Gallery (Progress Photos)                            */
/* ------------------------------------------------------------------ */

/**
 * Fetches all gallery photos for the authenticated user.
 */
export async function fetchGallery(
  accessToken: string,
  forceRefresh = false
): Promise<WgerGallery[]> {
  if (!forceRefresh) {
    const cached = readGalleryCache();
    if (cached) return cached.photos;
  }

  try {
    const photos = await fetchAllPages<WgerGallery>(
      `${WGER_BASE_URL}/gallery/?ordering=-date&limit=100`,
      { headers: { "Authorization": `Token ${accessToken}` } }
    );
    writeGalleryCache(photos);
    return photos;
  } catch (error) {
    console.error("[WgerBodyService] Failed to fetch gallery:", error);
    const cached = readGalleryCache();
    if (cached) return cached.photos;
    throw error;
  }
}

/**
 * Uploads a progress photo to wger gallery.
 */
export async function uploadGalleryPhoto(
  imageFile: File,
  date: string, // YYYY-MM-DD
  description: string,
  accessToken: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("date", date);
    formData.append("description", description);

    const response = await fetch(`${WGER_BASE_URL}/gallery/`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Token ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[WgerBodyService] Upload gallery photo failed:", error);
      return null;
    }

    const created = await response.json();
    invalidateGalleryCache();
    return created.uuid;
  } catch (error) {
    console.error("[WgerBodyService] Failed to upload gallery photo:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Cache invalidation                                                 */
/* ------------------------------------------------------------------ */

export function invalidateWeightCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(scopeKey(WEIGHT_CACHE_KEY));
    }
  } catch { }
}

export function invalidateMeasurementCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(scopeKey(MEASUREMENT_CACHE_KEY));
    }
  } catch { }
}

export function invalidateGalleryCache(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(scopeKey(GALLERY_CACHE_KEY));
    }
  } catch { }
}

export function invalidateAllBodyCache(): void {
  invalidateWeightCache();
  invalidateMeasurementCache();
  invalidateGalleryCache();
}

export function hasFreshWeightCache(): boolean {
  return readWeightCache() !== null;
}

export function hasFreshMeasurementCache(): boolean {
  return readMeasurementCache() !== null;
}

export function hasFreshGalleryCache(): boolean {
  return readGalleryCache() !== null;
}

export function getCachedWeightCount(): number {
  return readWeightCache()?.entries.length ?? 0;
}

export function getCachedMeasurementCount(): number {
  return readMeasurementCache()?.measurements.length ?? 0;
}

export function getCachedGalleryCount(): number {
  return readGalleryCache()?.photos.length ?? 0;
}