/**
 * Canonical Exercise schema for the LiftLogAI Exercise Library.
 *
 * Single source of truth for exercise data. Migrated from hasaneyldrm/
 * exercises-dataset (1,324 exercises) via `scripts/migrate-exercises.mjs`;
 * previously built from the Free Exercise DB (yuhonas/free-exercise-db,
 * Unlicense).
 *
 * The shape is intentionally rich so future AI features can query equipment,
 * target muscles, difficulty, body region, and training category without any
 * schema change (see EXERCISE_LIBRARY.md, "Future AI compatibility").
 */

/** Canonical muscle names (normalized from the dataset). */
export type Muscle =
  | "Abdominals"
  | "Abductors"
  | "Adductors"
  | "Biceps"
  | "Calves"
  | "Chest"
  | "Forearms"
  | "Glutes"
  | "Hamstrings"
  | "Lats"
  | "Lower Back"
  | "Middle Back"
  | "Neck"
  | "Quadriceps"
  | "Shoulders"
  | "Traps"
  | "Triceps";

/** Dataset training categories, title-cased. */
export type ExerciseCategory =
  | "Strength"
  | "Stretching"
  | "Plyometrics"
  | "Powerlifting"
  | "Olympic Weightlifting"
  | "Strongman"
  | "Cardio";

/** Equipment used, normalized to display labels. */
export type ExerciseEquipment =
  | "Barbell"
  | "Dumbbell"
  | "Machine"
  | "Cable"
  | "Bodyweight"
  | "EZ Bar"
  | "Kettlebell"
  | "Resistance Band"
  | "Exercise Ball"
  | "Medicine Ball"
  | "Foam Roll"
  | "Other"
  | "None";

/** Difficulty levels (dataset: beginner / intermediate / expert). */
export type ExerciseDifficulty = "Beginner" | "Intermediate" | "Expert";

/** Biomechanical classification. */
export type ExerciseMechanic = "Compound" | "Isolation";

/** Primary force production. */
export type ExerciseForce = "Pull" | "Push" | "Static";

/** High-level anatomical region used for filtering and related matching. */
export type BodyRegion =
  | "Chest"
  | "Back"
  | "Upper Body"
  | "Lower Body"
  | "Core"
  | "Full Body"
  | "Cardio";

export interface Exercise {
  /** Deterministic, unique slug (kept from the source dataset). */
  id: string;
  /** Display name. */
  name: string;
  /** Searchable variants / shorthand names. */
  aliases: string[];
  /** Training category. */
  category: ExerciseCategory;
  /** Equipment required. */
  equipment: ExerciseEquipment;
  /** Primary target muscles. */
  primaryMuscles: Muscle[];
  /** Secondary / synergist muscles. */
  secondaryMuscles: Muscle[];
  /** Experience level required. */
  difficulty: ExerciseDifficulty;
  /** Compound vs isolation, or null when not applicable. */
  mechanic: ExerciseMechanic | null;
  /** Pull / push / static, or null when not applicable. */
  force: ExerciseForce | null;
  /** Step-by-step instructions. May be empty when the source provides none. */
  instructions: string[];
  /** Coaching cues. Derived when the source provides none. */
  tips: string[];
  /** Bundled thumbnail filename (under src/assets/exercises/thumbnails/), or null. */
  image: string | null;
  /** Bundled thumbnail filename, or null. */
  thumbnail: string | null;
  /** Animated GIF filename (used on the details page), or null. */
  gif: string | null;
  /**
   * Optional future media: full video filename, or null. Reserved for when the
   * dataset ships video files. If ever wired into the UI it must NOT autoplay
   * (see the migration constraints) and should lazy-load like the GIF.
   */
  video: string | null;
  /** High-level anatomical region. */
  bodyRegion: BodyRegion;
}

/** Shape of the bundled dataset file (src/data/exercises.json). */
export interface ExerciseDataset {
  version: number;
  source: string;
  generatedAt: string;
  count: number;
  exercises: Exercise[];
}
