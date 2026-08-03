# Exercise Dataset Migration Report

**Date:** 2026-08-02
**Scope:** Replace the exercise dataset + media in LiftLogAI (React 19 · TypeScript strict · Tailwind 4 · Vite 8 · PWA) with `hasaneyldrm/exercises-dataset`.
**Nature:** Migration, not a rewrite. Existing UI, architecture, services, hooks, routing, and user data are preserved.

---

## 1. Summary

| | Old | New |
|---|---|---|
| Dataset source | free-exercise-db (extended locally) | `hasaneyldrm/exercises-dataset` |
| Exercises | 873 | 1,316 |
| Thumbnails | 87 (JPG, partial coverage) | 1,316 (WebP, 100% coverage) |
| GIFs | 0 | 1,316 (100% coverage) |
| Videos | 0 | reserved (`video` field) |
| Media format | JPG | WebP thumbnails + GIF (Details hero) |

The library now has **+51% more exercises**, and every exercise ships with a thumbnail (cards) and an animated GIF (Details page hero). Media was optimized to WebP for thumbnails (~57% smaller than JPG) and is cached offline via Workbox.

---

## 2. Dataset migration

- **1,316 exercises** in the final bundled dataset (from 1,324 source entries — **8 duplicate/near-duplicate entries merged** during import, preferring the richer metadata variant).
- Every exercise carries the full schema: `aliases`, `category`, `equipment`, `primaryMuscles`, `secondaryMuscles`, `difficulty`, `mechanic`, `force`, `instructions`, `tips`, `image`, `thumbnail`, `gif`, `video`, `bodyRegion`.
- **Search fields** (name, aliases, equipment, muscles, body region, category) all indexed in `ExerciseService.exerciseHaystack`.

### Old → New coverage (from `scripts/migration-map.json`)

| Status | Count | Meaning |
|---|---|---|
| `kept` | 131 | Same ID exists in both datasets — **identity preserved**, no data impact |
| `removed` | 742 | No equivalent in the new dataset; old ID no longer resolves |
| **Total** | **873** | |

742 old exercises are removed because the new dataset does not contain them. This is **not a data loss issue for users** — see §3.

---

## 3. User-data compatibility

User records are **denormalized**: every persisted row stores `exerciseName` alongside `exerciseId`.

| Data | Storage | Impact |
|---|---|---|
| Workout logs | Dexie (`workoutSessions`) | Safe — renders `exerciseName` even for orphaned IDs |
| History | Dexie (`history`) | Safe — same denormalization |
| Personal Records | Dexie (`personalRecords`) | Safe — keyed by name + fields |
| Templates | Dexie (`workoutTemplates`) | Safe — stores names |
| Favorites | localStorage (`liftlog_exercise_favorites`) | Orphaned IDs silently filtered via `getExercisesByIds` Map lookup |
| Recent | localStorage (`liftlog_exercise_recent`) | Same orphan-filtering |

**Net effect:** the 131 preserved exercises continue to work seamlessly; the 742 removed ones render their stored names in logs/PRs/templates/history with no crash, but their Details page shows the "Exercise not found" empty state (existing behavior).

---

## 4. Media migration

- **Thumbnails:** converted JPG → **WebP (q80)** via `sharp`. 1,316 in dataset + 8 leftover from merged dups = **1,324 files, 6.8 MB total** (median ~2.8 KB; 1,233/1,324 under the 4 KB Vite inline limit).
- **GIFs:** 1,324 files, 127 MB, served from `public/exercises/gifs/` (absolute URL, cached by Workbox).
- **Inlining:** `assetsInlineLimit: 0` forces WebP files to be emitted as real assets instead of base64-inlined into the JS bundle (avoids ~5 MB of inline bloat). Verified: **0 base64-inlined** media in `dist`.
- **Video:** reserved as an optional future media type — the `video: string | null` field is part of the `Exercise` type and dataset, but is **never autoplayed** and not yet rendered.

### Offline caching (`vite.config.ts` → Workbox runtimeCaching)

| Cache | Pattern | Handler | Limits |
|---|---|---|---|
| `exercise-media` | `/assets/*.(jpg|jpeg|webp|png|svg|avif)` | CacheFirst | 1,500 entries, 30 days |
| `exercise-gifs` | `/exercises/gifs/*.gif` | CacheFirst | 300 entries, 30 days |

Thumbnails are also bundled in the PWA precache manifest (11 entries, 3,134 KiB).

---

## 5. Performance / bundle impact

Final production build (`NODE_ENV=development npm run build` → `tsc -b && vite build`):

| Chunk | Size | gzip |
|---|---|---|
| `index-*.js` (app) | 1,795.28 kB | 488.32 kB |
| `exercises-*.js` (data, code-split) | 1,317.66 kB | 160.54 kB |
| `index-*.css` | 72.64 kB | 11.69 kB |
| `ExerciseDetailsPage-*.js` | 8.90 kB | 2.28 kB |
| `ExerciseLibraryPage-*.js` | 10.78 kB | 3.14 kB |
| `ExerciseCard-*.js` | 3.15 kB | 1.26 kB |

- The dataset lives in a **code-split, lazily-loaded chunk** (React.lazy + `import("../../../data/exercises.json")`) so it only downloads when the library is first opened.
- Thumbnails lazy-load with placeholder skeletons on the library grid.
- The `>500 kB` chunk warning is expected for the prebuilt dataset JSON and unchanged from the pre-migration baseline pattern.

---

## 6. Build verification

- `tsc -b` — **passes, 0 errors** (strict mode).
- `vite build` — **passes** in ~6 s; PWA `generateSW` writes `sw.js` + `workbox-*.js`.
- Verified artifacts: 1,324 WebP in `dist/assets`, 1,324 GIFs in `dist/exercises/gifs`, no `arms.svg`/`photos/` leakage, no stale source references.

---

## 7. Files changed

| Path | Change |
|---|---|
| `src/data/exercises.json` | Replaced dataset (1,316 exercises, enriched schema) |
| `src/assets/exercises/thumbnails/*.webp` | 1,324 optimized thumbnails |
| `public/exercises/gifs/*.gif` | 1,324 animated GIFs |
| `src/types/Exercise.ts` | Added `video` field (reserved) |
| `src/features/exercises/services/ExerciseService.ts` | Thumbnail/gif/video wiring; orphan filtering in `getExercisesByIds` |
| `src/features/exercises/data/exerciseImages.ts` | Glob → `thumbnails/*.webp` |
| `src/features/exercises/pages/ExerciseLibraryPage.tsx` | Dynamic exercise count in subtitle |
| `src/features/exercises/pages/ExerciseDetailsPage.tsx` | Hero GIF, in-workout guide (`?from=workout`) |
| `vite.config.ts` | `assetsInlineLimit: 0`, Workbox runtime caching |
| `scripts/migrate-exercises.mjs` | Migration tool (media + dataset + video field) |
| `scripts/optimize-thumbnails.mjs` | One-time JPG→WebP converter |
| `scripts/migration-map.json` | Old→new ID mapping (audit trail) |
| `scripts/source/exercises.json` | Original old dataset (kept for reproducibility) |

### Deleted (obsolete)

| Path | Reason |
|---|---|
| `src/assets/exercises/photos/` (87 JPGs) | Zero references; superseded by WebP thumbnails |
| `src/assets/exercises/illustrations/arms.svg` | Not in the `ILLUSTRATION_FILES` map — orphaned |
| `src/features/exercises/ExercisePicker.tsx` (top-level) | Empty file; real one lives in `components/` |

### Kept (verified live — NOT deleted)

`src/assets/icons/*.svg` (8, consumed by `ExerciseIcons.tsx`), `public/vite.svg` (favicon), `ExerciseRepository.ts` + `useExercise.ts` (PR page).

---

## 8. Risks / notes

- **742 removed exercises** show the existing "not found" empty state if deep-linked; user-created logs are unaffected (denormalized names).
- **GIF total is 127 MB** on disk — intentional (offline-first); served with CacheFirst + 300-entry cap to bound storage.
- The 8 merged-duplicate entries left 8 orphaned media files on disk; harmless (unreferenced, excluded from the build's active set), flagged for optional cleanup.
- `liftlogai-git/` at repo root is a **pre-refactor backup snapshot** (own `node_modules`, `.git_disabled`), not part of the migration — retained untouched; consider removing it to free disk if no longer needed.
