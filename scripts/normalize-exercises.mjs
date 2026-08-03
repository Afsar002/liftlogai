/**
 * normalize-exercises.mjs
 *
 * Converts the Free Exercise DB dataset (yuhonas/free-exercise-db, Unlicense)
 * into the canonical LiftLogAI exercise library:
 *
 *   scripts/source/exercises.json  ->  src/data/exercises.json
 *
 * The source dataset lives in-repo so the build is reproducible offline.
 * Run with `--images` to additionally download the curated exercise photos
 * into src/assets/exercises/photos/ (skips exercises that already exist).
 *
 *   node scripts/normalize-exercises.mjs [--images]
 *
 * Normalization steps:
 *   1. Map dataset fields onto the canonical Exercise schema (src/types/Exercise.ts).
 *   2. Normalize enums to title case (equipment, difficulty, force, mechanic, category).
 *   3. Derive fields the dataset does not provide: aliases, tips, bodyRegion.
 *   4. Generate deterministic ids (the dataset slugs are already deterministic & unique).
 *   5. Dedupe on id (and fall back to name).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "scripts", "source", "exercises.json");
const OUT = join(ROOT, "src", "data", "exercises.json");
const PHOTOS_DIR = join(ROOT, "src", "assets", "exercises", "photos");

const WANT_IMAGES = process.argv.includes("--images");

/* ------------------------------------------------------------------ */
/* Curated photo list: ids of the most common/valuable exercises that  */
/* get a real bundled photo. Everything else falls back to an SVG      */
/* muscle-group illustration. Missing ids are skipped gracefully.      */
/* ------------------------------------------------------------------ */
const CURATED_PHOTO_IDS = new Set([
  // Chest
  "Barbell_Bench_Press_-_Medium_Grip",
  "Barbell_Incline_Bench_Press_-_Medium_Grip",
  "Incline_Dumbbell_Press",
  "Dumbbell_Bench_Press",
  "Dumbbell_Flyes",
  "Decline_Dumbbell_Bench_Press",
  "Decline_Dumbbell_Flyes",
  "Cable_Crossover",
  "Pushups",
  "Bench_Press_-_Powerlifting",
  "Dips_-_Chest_Version",
  "Close-Grip_Barbell_Bench_Press",
  // Back
  "Barbell_Deadlift",
  "Romanian_Deadlift",
  "Sumo_Deadlift",
  "Deficit_Deadlift",
  "Bent_Over_Barbell_Row",
  "One-Arm_Dumbbell_Row",
  "Bent_Over_Two-Dumbbell_Row",
  "Pullups",
  "Chin-Up",
  "Close-Grip_Front_Lat_Pulldown",
  "Full_Range-Of-Motion_Lat_Pulldown",
  "Seated_Cable_Rows",
  "Straight-Arm_Pulldown",
  "Dumbbell_Incline_Row",
  "Hyperextensions_Back_Extensions",
  "Good_Morning",
  "Barbell_Shrug",
  "Dumbbell_Shrug",
  // Legs / glutes / calves
  "Barbell_Squat",
  "Front_Barbell_Squat",
  "Barbell_Hack_Squat",
  "Hack_Squat",
  "Leg_Press",
  "Overhead_Squat",
  "Barbell_Lunge",
  "Barbell_Walking_Lunge",
  "Dumbbell_Lunges",
  "Dumbbell_Rear_Lunge",
  "Leg_Extensions",
  "Lying_Leg_Curls",
  "Calf_Press",
  "Seated_Calf_Raise",
  "Barbell_Seated_Calf_Raise",
  "Barbell_Hip_Thrust",
  "Barbell_Glute_Bridge",
  "Box_Squat",
  // Shoulders
  "Barbell_Shoulder_Press",
  "Dumbbell_Shoulder_Press",
  "Arnold_Dumbbell_Press",
  "Side_Lateral_Raise",
  "Seated_Side_Lateral_Raise",
  "Front_Dumbbell_Raise",
  "Face_Pull",
  "Cuban_Press",
  // Arms
  "Barbell_Curl",
  "Dumbbell_Alternate_Bicep_Curl",
  "Dumbbell_Bicep_Curl",
  "Hammer_Curls",
  "Preacher_Curl",
  "Concentration_Curls",
  "EZ-Bar_Curl",
  "Triceps_Pushdown",
  "Cable_Rope_Overhead_Triceps_Extension",
  "Bench_Dips",
  "Dips_-_Triceps_Version",
  "EZ-Bar_Skullcrusher",
  "Overhead_Triceps",
  // Core
  "Plank",
  "Crunches",
  "Russian_Twist",
  "Hanging_Leg_Raise",
  "Barbell_Ab_Rollout",
  "Mountain_Climbers",
  "Superman",
  "Flat_Bench_Lying_Leg_Raise",
  // Full body / olympic / plyo
  "Clean_and_Jerk",
  "Snatch",
  "Power_Clean",
  "Clean",
  "Clean_Pull",
  "Snatch_Deadlift",
  "One-Arm_Kettlebell_Swings",
  "Box_Jump_Multiple_Response",
  "Front_Box_Jump",
  "Push_Up_to_Side_Plank",
]);

/* ------------------------------------------------------------------ */
/* Enum normalization tables                                          */
/* ------------------------------------------------------------------ */
const EQUIPMENT_MAP = {
  "body only": "Bodyweight",
  "e-z curl bar": "EZ Bar",
  kettlebells: "Kettlebell",
  bands: "Resistance Band",
  "exercise ball": "Exercise Ball",
  "medicine ball": "Medicine Ball",
  "foam roll": "Foam Roll",
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  machine: "Machine",
  other: "Other",
  null: "None",
};

const DIFFICULTY_MAP = { beginner: "Beginner", intermediate: "Intermediate", expert: "Expert" };

const MECHANIC_MAP = { compound: "Compound", isolation: "Isolation" };

const FORCE_MAP = { pull: "Pull", push: "Push", static: "Static" };

const CATEGORY_MAP = {
  strength: "Strength",
  stretching: "Stretching",
  plyometrics: "Plyometrics",
  powerlifting: "Powerlifting",
  "olympic weightlifting": "Olympic Weightlifting",
  strongman: "Strongman",
  cardio: "Cardio",
};

const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/* ------------------------------------------------------------------ */
/* Field derivation                                                   */
/* ------------------------------------------------------------------ */

// Canonical muscle names (single source of truth, also used by filters/AI).
const MUSCLE_TITLES = {
  abdominals: "Abdominals",
  abductors: "Abductors",
  adductors: "Adductors",
  biceps: "Biceps",
  calves: "Calves",
  chest: "Chest",
  forearms: "Forearms",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  lats: "Lats",
  "lower back": "Lower Back",
  "middle back": "Middle Back",
  neck: "Neck",
  quadriceps: "Quadriceps",
  shoulders: "Shoulders",
  traps: "Traps",
  triceps: "Triceps",
};

const REGION_RULES = [
  { region: "Chest", muscles: ["Chest"] },
  { region: "Back", muscles: ["Back", "Lats", "Lower Back", "Middle Back", "Traps", "Neck"] },
  { region: "Upper Body", muscles: ["Shoulders", "Biceps", "Triceps", "Forearms"] },
  { region: "Lower Body", muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Abductors", "Adductors"] },
  { region: "Core", muscles: ["Abdominals"] },
];

function deriveBodyRegion(primaryMuscles, category) {
  if (category === "Cardio") return "Cardio";

  const regions = new Set();
  for (const muscle of primaryMuscles) {
    for (const rule of REGION_RULES) {
      if (rule.muscles.includes(muscle)) regions.add(rule.region);
    }
  }

  if (regions.size === 0) return "Full Body";
  if (regions.size === 1) return [...regions][0];
  return "Full Body";
}

const EQUIPMENT_STRIP = /^(barbell |dumbbell |cable |machine |kettlebell |exercise ball |medicine ball |ez-?bar |one[- ]arm |single[- ]leg |one[- ]leg )+/i;

function deriveAliases(name) {
  const lower = name.toLowerCase();
  const stripped = lower
    .replace(/\s*\(.*?\)/g, "")
    .replace(EQUIPMENT_STRIP, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = stripped
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["with", "and", "from", "the"].includes(w));

  const candidates = new Set([lower, stripped, tokens.join(" ")]);
  // individual meaningful tokens aid fuzzy matching ("bench", "curl", "row")
  tokens.forEach((t) => candidates.add(t));

  // drop near-duplicates of the name itself and cap the list
  return [...candidates]
    .filter((a) => a.length > 2 && a !== lower)
    .slice(0, 5);
}

function deriveTips({ mechanic, force, category }) {
  const tips = [];
  if (mechanic === "Compound") tips.push("Warm up with lighter sets before your working sets.");
  else if (mechanic === "Isolation") tips.push("Control the tempo and avoid swinging or momentum.");
  if (force === "Static") tips.push("Brace your core and keep a steady, even breath.");
  if (category === "Stretching") tips.push("Move slowly and stop at mild tension, never sharp pain.");
  if (category === "Plyometrics" || category === "Cardio") tips.push("Land softly and keep your joints stacked.");
  tips.push("Focus on full range of motion with smooth form.");
  return tips.slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* Normalize                                                          */
/* ------------------------------------------------------------------ */
function normalize(raw) {
  const exercises = [];
  const seenIds = new Set();
  const seenNames = new Set();
  let dropped = 0;

  for (const entry of raw) {
    const id = entry.id?.trim();
    if (!id) continue;

    // dedupe by deterministic id, then by normalized name
    if (seenIds.has(id)) {
      dropped++;
      continue;
    }
    seenIds.add(id);

    const name = entry.name?.trim();
    if (!name) continue;
    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) {
      dropped++;
      continue;
    }
    seenNames.add(nameKey);

    const category = CATEGORY_MAP[entry.category] ?? titleCase(String(entry.category ?? "other"));
    const primaryMuscles = (entry.primaryMuscles ?? []).map(
      (m) => MUSCLE_TITLES[m.toLowerCase()] ?? titleCase(m)
    );
    const secondaryMuscles = (entry.secondaryMuscles ?? []).map(
      (m) => MUSCLE_TITLES[m.toLowerCase()] ?? titleCase(m)
    );
    const equipmentKey = entry.equipment ? String(entry.equipment).toLowerCase() : "null";
    const curated = CURATED_PHOTO_IDS.has(id);
    const hasImage = curated && (entry.images?.length ?? 0) > 0;

    exercises.push({
      id,
      name,
      aliases: deriveAliases(name),
      category,
      equipment: EQUIPMENT_MAP[equipmentKey] ?? titleCase(equipmentKey),
      primaryMuscles,
      secondaryMuscles,
      difficulty: DIFFICULTY_MAP[entry.level] ?? titleCase(String(entry.level ?? "")),
      mechanic: MECHANIC_MAP[entry.mechanic] ?? null,
      force: FORCE_MAP[entry.force] ?? null,
      instructions: entry.instructions ?? [],
      tips: deriveTips({ mechanic: MECHANIC_MAP[entry.mechanic], force: FORCE_MAP[entry.force], category }),
      image: hasImage ? `${id}.jpg` : null,
      thumbnail: hasImage ? `${id}.jpg` : null,
      bodyRegion: deriveBodyRegion(primaryMuscles, category),
    });
  }

  exercises.sort((a, b) => a.name.localeCompare(b.name));
  return { exercises, dropped };
}

/* ------------------------------------------------------------------ */
/* Curated image download                                             */
/* ------------------------------------------------------------------ */
async function downloadImages(exercises) {
  const curated = exercises.filter((e) => e.image);
  console.log(`Downloading ${curated.length} curated photos...`);
  mkdirSync(PHOTOS_DIR, { recursive: true });

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const ex of curated) {
    const dest = join(PHOTOS_DIR, ex.image);
    if (existsSync(dest)) {
      skipped++;
      continue;
    }

    // first dataset image (0.jpg) is the canonical pose
    const url = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${encodeURIComponent(ex.id)}/0.jpg`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(dest, buf);
      ok++;
      console.log(`  saved ${ex.id}.jpg (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      failed++;
      console.warn(`  SKIP ${ex.id}: ${err.message}`);
    }
    // be gentle with GitHub raw rate limits
    await new Promise((r) => setTimeout(r, 60));
  }

  console.log(`Images: ${ok} downloaded, ${skipped} existing, ${failed} failed`);
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */
const raw = JSON.parse(readFileSync(SOURCE, "utf8"));
const { exercises, dropped } = normalize(raw);

mkdirSync(dirname(OUT), { recursive: true });
const output = {
  version: 1,
  source: "yuhonas/free-exercise-db (Unlicense) — dist/exercises.json",
  generatedAt: new Date().toISOString().slice(0, 10),
  count: exercises.length,
  exercises,
};

writeFileSync(OUT, JSON.stringify(output, null, 2));
console.log(
  `Wrote ${exercises.length} exercises -> ${OUT.replace(ROOT, ".")} (${(Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(0)} KB, ${dropped} duplicates dropped)`
);

if (WANT_IMAGES) {
  await downloadImages(exercises);
}
