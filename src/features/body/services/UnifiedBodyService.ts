import * as WgerBodyService from "./WgerBodyService";
import { bodySync } from "../../../shared/lib/SyncManager";
import { getWgerUnitIdByName } from "../../../shared/lib/wgerUnits";

/* ------------------------------------------------------------------ */
/* Local Body Data (stored in localStorage/IndexedDB)                 */
/* ------------------------------------------------------------------ */

const LOCAL_WEIGHT_KEY = "liftlog_body_weight_entries";
const LOCAL_MEASUREMENT_KEY = "liftlog_body_measurements";
const LOCAL_GALLERY_KEY = "liftlog_body_gallery";

export interface LocalWeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in preferred unit
  unit: "kg" | "lb";
  source: "local" | "wger";
  wgerUuid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalMeasurement {
  id: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  date: string; // YYYY-MM-DD
  value: number;
  notes: string;
  source: "local" | "wger";
  wgerUuid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalGalleryPhoto {
  id: string;
  date: string; // YYYY-MM-DD
  imageUrl: string; // data URL or blob URL
  description: string;
  source: "local" | "wger";
  wgerUuid?: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Local Storage Helpers                                              */
/* ------------------------------------------------------------------ */

function readLocalWeight(): LocalWeightEntry[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = localStorage.getItem(LOCAL_WEIGHT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalWeightEntry[];
  } catch {
    return [];
  }
}

function writeLocalWeight(entries: LocalWeightEntry[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(LOCAL_WEIGHT_KEY, JSON.stringify(entries));
  } catch { }
}

function readLocalMeasurements(): LocalMeasurement[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = localStorage.getItem(LOCAL_MEASUREMENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalMeasurement[];
  } catch {
    return [];
  }
}

function writeLocalMeasurements(entries: LocalMeasurement[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(LOCAL_MEASUREMENT_KEY, JSON.stringify(entries));
  } catch { }
}

function readLocalGallery(): LocalGalleryPhoto[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = localStorage.getItem(LOCAL_GALLERY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalGalleryPhoto[];
  } catch {
    return [];
  }
}

function writeLocalGallery(photos: LocalGalleryPhoto[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(photos));
  } catch { }
}

/* ------------------------------------------------------------------ */
/* Public API - Weight                                                */
/* ------------------------------------------------------------------ */

/**
 * Gets all local weight entries.
 */
export function getLocalWeightEntries(): LocalWeightEntry[] {
  return readLocalWeight().sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Adds a local weight entry.
 */
export function addLocalWeightEntry(entry: Omit<LocalWeightEntry, "id" | "createdAt" | "updatedAt">): LocalWeightEntry {
  const entries = readLocalWeight();
  const now = new Date().toISOString();
  const newEntry: LocalWeightEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  writeLocalWeight([...entries, newEntry]);
  return newEntry;
}

/**
 * Updates a local weight entry.
 */
export function updateLocalWeightEntry(id: string, updates: Partial<LocalWeightEntry>): LocalWeightEntry | null {
  const entries = readLocalWeight();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated = { ...entries[index], ...updates, updatedAt: new Date().toISOString() };
  entries[index] = updated;
  writeLocalWeight(entries);
  return updated;
}

/**
 * Deletes a local weight entry.
 */
export function deleteLocalWeightEntry(id: string): void {
  const entries = readLocalWeight().filter((e) => e.id !== id);
  writeLocalWeight(entries);
}

/* ------------------------------------------------------------------ */
/* Public API - Measurements                                          */
/* ------------------------------------------------------------------ */

/**
 * Gets all local measurements.
 */
export function getLocalMeasurements(): LocalMeasurement[] {
  return readLocalMeasurements().sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Adds a local measurement.
 */
export function addLocalMeasurement(entry: Omit<LocalMeasurement, "id" | "createdAt" | "updatedAt">): LocalMeasurement {
  const entries = readLocalMeasurements();
  const now = new Date().toISOString();
  const newEntry: LocalMeasurement = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  writeLocalMeasurements([...entries, newEntry]);
  return newEntry;
}

/**
 * Updates a local measurement.
 */
export function updateLocalMeasurement(id: string, updates: Partial<LocalMeasurement>): LocalMeasurement | null {
  const entries = readLocalMeasurements();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated = { ...entries[index], ...updates, updatedAt: new Date().toISOString() };
  entries[index] = updated;
  writeLocalMeasurements(entries);
  return updated;
}

/**
 * Deletes a local measurement.
 */
export function deleteLocalMeasurement(id: string): void {
  const entries = readLocalMeasurements().filter((e) => e.id !== id);
  writeLocalMeasurements(entries);
}

/**
 * Gets measurements grouped by category for charts.
 */
export function getMeasurementsByCategory(): WgerBodyService.LocalMeasurement[] {
  const entries = getLocalMeasurements();
  const grouped = new Map<number, Array<{ date: string; value: number; notes: string }>>();

  for (const m of entries) {
    if (!grouped.has(m.categoryId)) {
      grouped.set(m.categoryId, []);
    }
    grouped.get(m.categoryId)!.push({ date: m.date, value: m.value, notes: m.notes });
  }

  const result: WgerBodyService.LocalMeasurement[] = [];
  for (const [categoryId, categoryEntries] of grouped) {
    const first = entries.find((e) => e.categoryId === categoryId);
    if (!first) continue;

    result.push({
      categoryId,
      categoryName: first.categoryName,
      unit: first.unit,
      entries: categoryEntries.sort((a, b) => a.date.localeCompare(b.date)),
    });
  }

  return result.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}

/* ------------------------------------------------------------------ */
/* Public API - Gallery (Progress Photos)                             */
/* ------------------------------------------------------------------ */

/**
 * Gets all local progress photos.
 */
export function getLocalGallery(): LocalGalleryPhoto[] {
  return readLocalGallery().sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Adds a local progress photo.
 */
export function addLocalGalleryPhoto(photo: Omit<LocalGalleryPhoto, "id" | "createdAt">): LocalGalleryPhoto {
  const photos = readLocalGallery();
  const now = new Date().toISOString();
  const newPhoto: LocalGalleryPhoto = {
    ...photo,
    id: crypto.randomUUID(),
    createdAt: now,
  };
  writeLocalGallery([newPhoto, ...photos]); // Newest first
  return newPhoto;
}

/**
 * Deletes a local progress photo.
 */
export function deleteLocalGalleryPhoto(id: string): void {
  const photos = readLocalGallery().filter((p) => p.id !== id);
  writeLocalGallery(photos);
}

/* ------------------------------------------------------------------ */
/* Cloud Sync Configuration                                           */
/* ------------------------------------------------------------------ */

/**
 * Checks if body sync is configured.
 */
export function isSyncEnabled(): boolean {
  return bodySync.isEnabled();
}

/**
 * Configures wger body sync.
 */
export async function configureSync(accessToken: string): Promise<boolean> {
  return bodySync.configure(accessToken, async (token) => {
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
 * Disables body sync.
 */
export function disableSync(): void {
  bodySync.disable();
}

export function setAutoSync(enabled: boolean): void {
  bodySync.setAutoSync(enabled);
}

export function getAutoSync(): boolean {
  return bodySync.getAutoSync();
}

export function setPreferredUnit(unit: "kg" | "lb"): void {
  bodySync.setPreferredUnit(unit);
}

export function getPreferredUnit(): "kg" | "lb" {
  return bodySync.getPreferredUnit();
}

/* ------------------------------------------------------------------ */
/* Sync Operations                                                    */
/* ------------------------------------------------------------------ */

export interface BodySyncResult {
  weight: { pushed: number; pulled: number };
  measurements: { pushed: number; pulled: number };
  gallery: { pushed: number; pulled: number };
  errors: string[];
}

/**
 * Performs a full bidirectional sync with wger for body data.
 */
export async function syncWithWger(): Promise<BodySyncResult> {
  if (!bodySync.isEnabled()) {
    return {
      weight: { pushed: 0, pulled: 0 },
      measurements: { pushed: 0, pulled: 0 },
      gallery: { pushed: 0, pulled: 0 },
      errors: ["Sync not configured"],
    };
  }

  const accessToken = bodySync.getAccessToken()!;
  const preferredUnit = bodySync.getPreferredUnit();
  const result: BodySyncResult = {
    weight: { pushed: 0, pulled: 0 },
    measurements: { pushed: 0, pulled: 0 },
    gallery: { pushed: 0, pulled: 0 },
    errors: [],
  };

  try {
    // --- WEIGHT SYNC ---
    // Push local weight entries not on wger
    const localWeight = getLocalWeightEntries().filter((e) => e.source === "local" && !e.wgerUuid);
    for (const entry of localWeight) {
      // Resolve the entry's weight unit to its wger unit ID instead of
      // hardcoding (kg=1, lb=2) which isn't part of a stable API contract.
      // Local entries store weight in the user's preferred unit, so we can
      // push the same number with the correct unit label.
      const weightUnit = entry.unit ?? preferredUnit;
      const resolvedUnitId = await getWgerUnitIdByName(weightUnit, accessToken);
      if (resolvedUnitId == null) {
        result.errors.push(`Could not resolve wger unit ID for "${entry.unit}" (${entry.date})`);
        continue;
      }
      const wgerUuid = await WgerBodyService.createWeightEntry(
        entry.weight,
        entry.date,
        resolvedUnitId,
        accessToken
      );

      if (wgerUuid) {
        updateLocalWeightEntry(entry.id, { source: "wger", wgerUuid, updatedAt: new Date().toISOString() });
        result.weight.pushed++;
      } else {
        result.errors.push(`Failed to push weight entry ${entry.date}`);
      }
    }

    // Pull wger weight entries not local
    const wgerWeight = await WgerBodyService.fetchWeightEntries(accessToken, true);
    const localWeightDates = new Set(getLocalWeightEntries().map((e) => e.date));
    const localWeightUuids = new Set(getLocalWeightEntries().filter((e) => e.wgerUuid).map((e) => e.wgerUuid));

    for (const wgerEntry of wgerWeight) {
      if (localWeightUuids.has(wgerEntry.uuid)) continue;

      const localEntry = WgerBodyService.convertWeightEntriesToLocal([wgerEntry], preferredUnit)[0];
      if (localEntry && !localWeightDates.has(localEntry.date)) {
        addLocalWeightEntry({
          ...localEntry,
          unit: preferredUnit, // Ensure unit is the correct literal type
          source: "wger",
          wgerUuid: wgerEntry.uuid,
        });
        result.weight.pulled++;
      }
    }

    // --- MEASUREMENTS SYNC ---
    // Push local measurements not on wger
    const localMeasurements = getLocalMeasurements().filter((e) => e.source === "local" && !e.wgerUuid);
    // Need category mapping from wger
    const { categories: wgerCategories } = await WgerBodyService.fetchMeasurements(accessToken, true);
    const categoryNameToId = new Map(wgerCategories.map((c) => [c.name, c.id]));

    for (const entry of localMeasurements) {
      const wgerCategoryId = categoryNameToId.get(entry.categoryName);
      if (!wgerCategoryId) {
        result.errors.push(`Unknown measurement category: ${entry.categoryName}`);
        continue;
      }

      const wgerUuid = await WgerBodyService.createMeasurement(
        wgerCategoryId,
        entry.value,
        entry.date,
        entry.notes,
        accessToken
      );

      if (wgerUuid) {
        updateLocalMeasurement(entry.id, { source: "wger", wgerUuid, updatedAt: new Date().toISOString() });
        result.measurements.pushed++;
      } else {
        result.errors.push(`Failed to push measurement ${entry.categoryName} ${entry.date}`);
      }
    }

    // Pull wger measurements not local
    const { measurements: wgerMeasurements } = await WgerBodyService.fetchMeasurements(accessToken, true);
    const localMeasurementUuids = new Set(
      getLocalMeasurements().filter((e) => e.wgerUuid).map((e) => e.wgerUuid)
    );

    const localMeasurementsByCategory = getMeasurementsByCategory();
    for (const wgerEntry of wgerMeasurements) {
      if (localMeasurementUuids.has(wgerEntry.uuid)) continue;

      // Find or create local entry
      // This is simplified - in practice would need better matching
      const category = wgerCategories.find((c) => c.id === wgerEntry.category);
      if (!category) continue;

      addLocalMeasurement({
        categoryId: category.id,
        categoryName: category.name,
        unit: category.unit,
        date: wgerEntry.date,
        value: wgerEntry.value,
        notes: wgerEntry.notes,
        source: "wger",
        wgerUuid: wgerEntry.uuid,
      });
      result.measurements.pulled++;
    }

    // --- GALLERY SYNC ---
    // Push local photos not on wger (requires file upload - more complex)
    // For now, skip push - would need File/Blob handling

    // Pull wger gallery photos
    const wgerGallery = await WgerBodyService.fetchGallery(accessToken, true);
    const localGalleryUuids = new Set(getLocalGallery().filter((p) => p.wgerUuid).map((p) => p.wgerUuid));

    for (const photo of wgerGallery) {
      if (localGalleryUuids.has(photo.uuid)) continue;

      addLocalGalleryPhoto({
        date: photo.date,
        imageUrl: photo.image,
        description: photo.description,
        source: "wger",
        wgerUuid: photo.uuid,
      });
      result.gallery.pulled++;
    }

    bodySync.setLastSyncAt(new Date().toISOString());
    return result;
  } catch (error) {
    result.errors.push(`Sync failed: ${error}`);
    return result;
  }
}

/* ------------------------------------------------------------------ */
/* Cache Management                                                   */
/* ------------------------------------------------------------------ */

export function invalidateWgerBodyCache(): void {
  WgerBodyService.invalidateAllBodyCache();
}

export function hasFreshWgerWeightCache(): boolean {
  return WgerBodyService.hasFreshWeightCache();
}

export function hasFreshWgerMeasurementCache(): boolean {
  return WgerBodyService.hasFreshMeasurementCache();
}

export function hasFreshWgerGalleryCache(): boolean {
  return WgerBodyService.hasFreshGalleryCache();
}

export function getCachedWgerWeightCount(): number {
  return WgerBodyService.getCachedWeightCount();
}

export function getCachedWgerMeasurementCount(): number {
  return WgerBodyService.getCachedMeasurementCount();
}

export function getCachedWgerGalleryCount(): number {
  return WgerBodyService.getCachedGalleryCount();
}

/* ------------------------------------------------------------------ */
/* Re-exports from WgerBodyService                                    */
/* ------------------------------------------------------------------ */

export {
  fetchWeightEntries,
  fetchMeasurements,
  fetchMeasurementCategories,
  fetchGallery,
  createWeightEntry,
  createMeasurement,
  uploadGalleryPhoto,
  invalidateWeightCache,
  invalidateMeasurementCache,
  invalidateGalleryCache,
  invalidateAllBodyCache,
} from "./WgerBodyService";