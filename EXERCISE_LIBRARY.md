# Exercise Library

A fully offline, searchable exercise library integrated into LiftLogAI. Contains 873 exercises from the [free-exercise-db](https://github.com/AmarSodanovic/free-exercise-db) dataset (Unlicense) with curated images and a Zustand-powered favorites/recent system backed by Dexie (IndexedDB).

## Architecture

```
src/features/exercises/
├── components/
│   ├── ExerciseCard.tsx          # Grid card: photo, name, muscle badge, equipment, difficulty, favorite
│   ├── ExerciseChart.tsx         # Progress chart for an exercise
│   ├── ExerciseFilters.tsx       # Muscle / equipment / difficulty filter panel
│   ├── ExerciseHeader.tsx        # Exercise name + metadata header
│   ├── ExerciseHistory.tsx       # Past performance log
│   ├── ExerciseIcons.tsx         # Muscle-region icon map
│   ├── ExerciseImage.tsx         # Lazy image with skeleton → photo → illustration → SVG fallback chain
│   ├── ExercisePicker.tsx        # Searchable exercise picker (shared across workout builder, templates, session)
│   ├── ExercisePickerModal.tsx   # Modal wrapper for ExercisePicker
│   ├── ExerciseSearch.tsx        # Search input with debounced onChange
│   ├── PRCard.tsx                # Personal record display
│   └── StrengthChart.tsx         # Strength-over-time chart
├── data/
│   └── exerciseImages.ts         # import.meta.glob mapping: exercise IDs → photo/illustration asset URLs
├── hooks/
│   ├── useExercise.ts            # Single-exercise lookup by ID
│   ├── useExerciseFavorites.ts   # Zustand store: favorites + recent with Dexie persistence
│   ├── useExerciseFilters.ts     # Filter state → memoized searchOptions bridge
│   └── useExerciseSearch.ts      # Debounced search with deep-equality guard on filter options
├── pages/
│   ├── ExerciseDetailsPage.tsx   # Full exercise detail: hero image, metadata, instructions, related
│   ├── ExerciseLibraryPage.tsx   # Library grid: All / Favorites / Recent tabs, search, filters
│   └── ExercisePage.tsx          # Exercise performance page (charts, history, PRs)
├── services/
│   ├── ExerciseService.ts        # Central facade: lazy-load dataset, Dexie merge, search, favorites, recent
│   ├── ExerciseRepository.ts     # Dexie CRUD for custom exercises
│   └── ExerciseLibraryRepository.ts  # Legacy repository (kept for custom exercise CRUD)
└── ExercisePicker.tsx            # Legacy picker (superseded by components/ExercisePicker.tsx)
```

## Dataset

**Source**: `free-exercise-db` by AmarSodanovic (Unlicense license)  
**Size**: 873 exercises, ~224KB JSON (code-split into a lazy Vite chunk)  
**Normalization**: All exercises are normalized to the canonical `Exercise` type at load time:

- `primaryMuscles` / `secondaryMuscles` → lowercase canonical `Muscle` unions
- `category` → `ExerciseCategory` enum (e.g. "strength" → "Compound")
- `equipment` → `ExerciseEquipment` enum (e.g. "barbell" → "Barbell")
- `difficulty` → `ExerciseDifficulty` enum ("beginner" | "intermediate" | "advanced")
- `mechanic` → `ExerciseMechanic` enum ("compound" | "isolation")
- `force` → `ExerciseForce` enum ("push" | "pull" | "static")
- `id` is the JSON's `name` field, normalized: spaces → underscores, special chars removed

## Canonical Exercise Type

Defined in `src/types/Exercise.ts` — the single source of truth:

```typescript
interface Exercise {
  id: string;                           // Normalized name (e.g. "Barbell_Bench_Press")
  name: string;                         // Human-readable (e.g. "Barbell Bench Press")
  bodyRegion: BodyRegion;               // "upper" | "mid" | "lower" | "full"
  primaryMuscles: Muscle[];             // Array of canonical muscle names
  secondaryMuscles: Muscle[];
  category: ExerciseCategory;           // "Compound" | "Isolation"
  equipment: ExerciseEquipment;         // "Barbell" | "Dumbbell" | "Cable" | etc.
  difficulty: ExerciseDifficulty;       // "Beginner" | "Intermediate" | "Advanced"
  mechanic: ExerciseMechanic;           // "Compound" | "Isolation" | null
  force: ExerciseForce;                 // "Push" | "Pull" | "Static" | null
  instructions: string[];
  images: string[];                     // Asset URLs from import.meta.glob
  isCustom?: boolean;                   // True for user-created exercises (Dexie-persisted)
}
```

## Image Loading

`ExerciseImage` component implements a cascading fallback chain:

1. **Photo** — curated JPG from `data/exerciseImages.ts` mapping (~87 exercises)
2. **Body-region illustration** — SVG per region (upper, mid, lower, full)
3. **Fallback SVG** — generic `other.svg`

All images use `React.lazy()` for code splitting and `IntersectionObserver` for viewport-based loading. A skeleton placeholder (`animate-pulse`) shows while loading.

## Search & Filter

**Search** (`useExerciseSearch`):
- Debounced at 250ms (matches `useFoodSearch` pattern)
- Deep-equality guard (`optionsEqual()`) prevents infinite re-render loops from fresh object defaults
- Searches `name` and `instructions` fields via `ExerciseService.searchExercises()`

**Filters** (`useExerciseFilters`):
- Produces stable, memoized `ExerciseSearchOptions` from filter state
- Options: `primaryMuscles[]`, `equipment[]`, `difficulty[]`
- Filter count badge shows active filter count
- Clear-all resets all filters

**Integration**: `ExerciseLibraryPage` passes `filters.searchOptions` into `useExerciseSearch(filters.searchOptions)` so filter changes trigger re-search.

## Favorites & Recent

- **Zustand store** (`useExerciseFavorites`): `favorites: Set<string>`, `recent: Exercise[]`
- **Dexie persistence**: Both favorites and recent lists stored in IndexedDB, loaded on mount
- **Library tabs**: All (search results) | Favorites (hearted exercises) | Recent (last 20 viewed)

## Picker Integration

`ExercisePickerModal` wraps `ExercisePicker` in a dialog. Used in:

- **Workout Builder** (dashboard → new workout)
- **Workout Session** (add exercise mid-workout)
- **Templates** (add exercise to template)

The picker searches the full 873-exercise dataset and returns the selected exercise's `id` to the caller.

## Code Splitting

- **Dataset JSON** (~224KB): `import("./exercises.json")` → lazy Vite chunk, loaded once and cached in memory
- **Photo assets**: `import.meta.glob("./photos/*.jpg", { query: "?url", import: "default" })` → individual asset URLs
- **Pages**: `React.lazy()` for `ExerciseLibraryPage` and `ExerciseDetailsPage`
- **Libraries**: `framer-motion` and `recharts` are code-split into separate chunks

## Type Safety

The canonical `Exercise` type in `src/types/Exercise.ts` is the ONLY exercise interface used in the runtime feature code. Legacy types (`src/types/workout.ts`, `src/database/exerciseDatabase.ts`, `src/constants/exercise.ts`, `src/features/exercises/data/exerciseLibrary.ts`) were removed — they contained duplicate, incompatible exercise definitions.

The Dexie row type (`ExerciseDB` in `src/database/types.ts`) uses simple `string` fields for muscles/equipment and is only bridged to the canonical type at the repository boundary (`ExerciseRepository`).

## Future Extension Points

- **AI exercise generation**: `ExerciseService` exposes `addExercise()` for programmatic exercise creation
- **Custom exercises**: `ExerciseRepository` supports full CRUD with `isCustom: true` flag
- **Body part filtering**: `BodyRegion` system supports region-based navigation
- **Progressive loading**: `IntersectionObserver` pattern enables lazy-loading large grids
