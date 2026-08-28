import type { WorkoutTemplateDB, TemplateExercise } from "../../../database/types";
import { TemplateRepository } from "../../templates/services/TemplateRepository";
import * as WgerTemplateService from "./WgerTemplateService";
import * as UnifiedExerciseService from "../../exercises/services/UnifiedExerciseService";
import { templateSync } from "../../../shared/lib/SyncManager";

/* ------------------------------------------------------------------ */
/* Caching                                                            */
/* ------------------------------------------------------------------ */

let unifiedTemplateCache: WorkoutTemplateDB[] | null = null;

/* ------------------------------------------------------------------ */
/* Public API - Cloud Sync (wger templates)                          */
/* ------------------------------------------------------------------ */

/**
 * Checks if cloud sync is configured and enabled.
 */
export function isSyncEnabled(): boolean {
  return templateSync.isEnabled();
}

/**
 * Gets the stored access token.
 */
export function getAccessToken(): string | null {
  return templateSync.getAccessToken();
}

/**
 * Configures wger sync with an access token.
 * Returns true if token is valid (tested with a quick API call).
 */
export async function configureSync(accessToken: string): Promise<boolean> {
  return templateSync.configure(accessToken, async (token) => {
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
 * Disables cloud sync.
 */
export function disableSync(): void {
  templateSync.disable();
}

/**
 * Sets auto-sync preference.
 */
export function setAutoSync(enabled: boolean): void {
  templateSync.setAutoSync(enabled);
}

/**
 * Gets auto-sync preference.
 */
export function getAutoSync(): boolean {
  return templateSync.getAutoSync();
}

/**
 * Gets last sync timestamp.
 */
export function getLastSyncAt(): string | null {
  return templateSync.getLastSyncAt();
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Loads all templates (local + imported from wger).
 * Wger templates are marked with source="wger" in description or separate field.
 */
export async function getAllTemplates(): Promise<WorkoutTemplateDB[]> {
  if (unifiedTemplateCache) return unifiedTemplateCache;

  const local = await TemplateRepository.getAll();
  // Wger templates would be loaded separately when user imports them
  // They're stored locally after import

  unifiedTemplateCache = local;
  return unifiedTemplateCache;
}

/**
 * Searches public wger templates for import.
 */
export async function searchPublicTemplates(query: string = ""): Promise<WgerTemplateService.WgerTemplate[]> {
  const all = await WgerTemplateService.fetchPublicTemplates();

  if (!query.trim()) return all;

  const tokens = query.toLowerCase().trim().split(/\s+/);
  return all.filter((template) => {
    const haystack = `${template.name} ${template.description} ${template.author}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

/**
 * Gets a wger template by UUID for preview/import.
 */
export async function getWgerTemplateById(uuid: string): Promise<WgerTemplateService.WgerTemplate | null> {
  return WgerTemplateService.fetchTemplateById(uuid);
}

/**
 * Imports a wger template to local storage.
 * Requires exercise ID mapping from wger exerciseinfo ID -> local Exercise.id
 */
export async function importWgerTemplate(
  wgerTemplate: WgerTemplateService.WgerTemplate
): Promise<WorkoutTemplateDB> {
  // Build exercise ID map
  const allExercises = await UnifiedExerciseService.getAllExercises();
  const exerciseIdMap = new Map<number, string>();

  for (const ex of allExercises) {
    // Extract wger UUID from exercise ID if it's a wger exercise
    if (ex.id.startsWith("wger-")) {
      const wgerUuid = ex.id.replace("wger-", "");
      // We'd need to map UUID to wger exerciseinfo ID
      // This requires a separate lookup table or API call
    }
  }

  // For now, create template with exercise IDs that match by name
  const localExercises = await UnifiedExerciseService.getAllExercises();
  const nameToId = new Map(localExercises.map((ex) => [ex.name.toLowerCase(), ex.id]));

  const exercises: TemplateExercise[] = [];
  let order = 0;

  for (const wgerEx of wgerTemplate.exercises) {
    const englishName = WgerTemplateService.getEnglishName(wgerEx.exercise_detail).toLowerCase();
    const localId = nameToId.get(englishName);

    if (localId) {
      const localExercise = localExercises.find((ex) => ex.id === localId);
      exercises.push({
        id: crypto.randomUUID(),
        name: localExercise?.name ?? englishName,
        targetSets: wgerEx.sets,
        targetReps: WgerTemplateService.parseReps(wgerEx.reps),
        rest: WgerTemplateService.parseRest(wgerEx.rest_time),
      });
      order++;
    }
  }

  const created = await TemplateRepository.create({
    name: wgerTemplate.name,
    exercises,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  invalidateUnifiedTemplateCache();
  return created;
}

/**
 * Invalidates the unified template cache.
 */
export function invalidateUnifiedTemplateCache(): void {
  unifiedTemplateCache = null;
  WgerTemplateService.invalidateWgerTemplateCache();
}

/**
 * Preloads public templates in background.
 */
export function preloadPublicTemplates(): void {
  WgerTemplateService.preloadWgerTemplates();
}

/* ------------------------------------------------------------------ */
/* Type re-exports                                                    */
/* ------------------------------------------------------------------ */

export type { WgerTemplate } from "./WgerTemplateService";
export {
  fetchPublicTemplates,
  fetchTemplateById,
  invalidateWgerTemplateCache,
  hasFreshWgerTemplateCache,
  getCachedWgerTemplateCount
} from "./WgerTemplateService";