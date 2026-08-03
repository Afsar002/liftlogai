import type { BodyRegion, Exercise } from "../../../types/Exercise";

/**
 * Resolves bundled exercise imagery.
 *
 * Every exercise in the migrated dataset has a 180x180 thumbnail bundled under
 * `src/assets/exercises/thumbnails/` and an animated GIF under
 * `public/exercises/gifs/`. Thumbnails go through `import.meta.glob` + `?url`
 * so they are emitted at build time, cacheable, and fully offline. GIFs are
 * served from `public/` (too large to bundle) and lazy-loaded only on the
 * details page. Exercises without a bundled thumbnail fall back to a local
 * SVG muscle-region illustration.
 *
 * `import.meta.glob` returns keys relative to the importing module, so the
 * filename -> URL maps are built from the basename of each key.
 */

const thumbnailModules = import.meta.glob("../../../assets/exercises/thumbnails/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const illustrationModules = import.meta.glob(
  "../../../assets/exercises/illustrations/*.svg",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

/** filename (e.g. "0001-2gPfomN.jpg") -> hashed asset URL */
const thumbnailUrls = new Map<string, string>();
for (const [path, url] of Object.entries(thumbnailModules)) {
  const file = path.split("/").pop();
  if (file) thumbnailUrls.set(file, url);
}

/** svg filename -> hashed asset URL */
const illustrationUrls = new Map<string, string>();
for (const [path, url] of Object.entries(illustrationModules)) {
  const file = path.split("/").pop();
  if (file) illustrationUrls.set(file, url);
}

const ILLUSTRATION_FILES: Record<BodyRegion, string> = {
  Chest: "chest.svg",
  Back: "back.svg",
  "Upper Body": "shoulders.svg",
  "Lower Body": "legs.svg",
  Core: "core.svg",
  "Full Body": "fullbody.svg",
  Cardio: "cardio.svg",
};

function illustrationUrl(file: string): string {
  return illustrationUrls.get(file) ?? otherIllustrationUrl;
}

const otherIllustrationUrl = illustrationUrls.get("other.svg") ?? "";

/** Hashed URL for a bundled thumbnail filename, if present. */
export function getExerciseThumbnailUrl(filename: string | null): string | undefined {
  if (!filename) return undefined;
  return thumbnailUrls.get(filename);
}

/** Public URL for an animated GIF (served from /public/exercises/gifs/). */
export function getExerciseGifUrl(filename: string | null): string | undefined {
  if (!filename) return undefined;
  return `/exercises/gifs/${encodeURIComponent(filename)}`;
}

/** Hashed URL for the illustration that represents a body region. */
export function getRegionIllustrationUrl(region: BodyRegion): string {
  return illustrationUrl(ILLUSTRATION_FILES[region] ?? "other.svg");
}

/**
 * Resolve the render sources for an exercise's thumbnail.
 *
 * @returns `primary`   — thumbnail URL when bundled, else the muscle-region
 *                        illustration (nothing blocks on a thumbnail)
 * @returns `fallback`  — illustration to swap in if the primary fails to load
 */
export function getExerciseImageSources(
  exercise: Pick<Exercise, "image" | "bodyRegion">
): { primary: string | null; fallback: string } {
  const thumb = getExerciseThumbnailUrl(exercise.image);
  const region = getRegionIllustrationUrl(exercise.bodyRegion);
  if (thumb) return { primary: thumb, fallback: region };
  return { primary: region, fallback: otherIllustrationUrl };
}
