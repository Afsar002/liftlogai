/**
 * migrate-exercises.mjs
 *
 * Migration layer: hasaneyldrm/exercises-dataset  ->  LiftLogAI canonical
 * Exercise library (src/data/exercises.json).
 *
 * This is a DATASET migration, not a rewrite — it normalizes the new source
 * into the existing canonical Exercise schema (src/types/Exercise.ts) without
 * touching any UI, service, hook, or user data.
 *
 *   node scripts/migrate-exercises.mjs [--source <path>] [--media]
 *
 *   --source   path to the new dataset JSON (array of raw exercises).
 *              Defaults to the sparse-cloned repo under the OS temp dir.
 *   --media    also copy the exercise media into the repo:
 *                thumbnails -> src/assets/exercises/thumbnails/
 *                GIFs       -> public/exercises/gifs/
 *              Media is expected next to the source JSON: <source>/../images
 *              and <source>/../videos (the repo's layout).
 *
 * Outputs:
 *   src/data/exercises.json      the normalized dataset (replaces the old one)
 *   scripts/migration-map.json   oldId -> newId table for every old exercise
 *
 * Normalization decisions (see EXERCISE_LIBRARY.md):
 *   1. id      — reuse the OLD id when the exercise also existed in the old
 *                dataset (exact, case-insensitive name match), preserving
 *                favorites/logs/templates. New exercises get a deterministic
 *                slug from the title-cased name.
 *   2. name    — title-cased for display (source names are lowercase).
 *   3. category— derived heuristically from the name (Strength / Stretching /
 *                Plyometrics / Powerlifting / Olympic Weightlifting /
 *                Strongman / Cardio). The source's `category` field is a body
 *                part, which maps to `bodyRegion` instead.
 *   4. equipment — source uses 28 free-text values; mapped to the 13 canonical
 *                ExerciseEquipment labels.
 *   5. muscles — source `target`/`muscle_group`/`secondary_muscles` use free
 *                text; mapped to the 17 canonical Muscle values. Unmapped
 *                values are kept searchable via `aliases`.
 *   6. difficulty — source provides none; derived heuristically from the name.
 *   7. mechanic / force — source provides none; set to null.
 *   8. instructions — source `instruction_steps.en` (already an ordered array).
 *   9. tips    — derived from the training category.
 *   10. image / thumbnail — source has one 180x180 thumbnail per exercise.
 *   11. gif    — NEW canonical field; source has one animated GIF per exercise.
 *   12. video  — reserved for future media; the source ships no video files
 *                (always null). Never autoplay if wired into the UI later.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const sourceArg = process.argv.indexOf("--source");
const DEFAULT_SOURCE = join(
  homedir(),
  "AppData",
  "Local",
  "Temp",
  "exercises-dataset",
  "data",
  "exercises.json"
);
const SOURCE = sourceArg >= 0 ? process.argv[sourceArg + 1] : DEFAULT_SOURCE;
// The previous dataset (free-exercise-db, committed raw) is the ID-preservation
// baseline. Referencing the committed raw source — not the current
// src/data/exercises.json — keeps the migration idempotent and reproducible.
const OLD_RAW = join(ROOT, "scripts", "source", "exercises.json");
const OUT = join(ROOT, "src", "data", "exercises.json");
const MIGRATION_OUT = join(ROOT, "scripts", "migration-map.json");
const THUMBS_OUT = join(ROOT, "src", "assets", "exercises", "thumbnails");
const GIFS_OUT = join(ROOT, "public", "exercises", "gifs");
const WANT_MEDIA = process.argv.includes("--media");

const norm = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s/])[a-z]/g, (m) => m.toUpperCase())
    .replace(/\bez\b/g, "EZ");

const slugify = (title) => title.replace(/[^A-Za-z0-9-]+/g, "_").replace(/^_+|_+$/g, "");

/* ------------------------------------------------------------------ */
/* Enum mapping tables                                                 */
/* ------------------------------------------------------------------ */

const EQUIPMENT_MAP = {
  "body weight": "Bodyweight",
  barbell: "Barbell",
  "olympic barbell": "Barbell",
  "trap bar": "Barbell",
  dumbbell: "Dumbbell",
  cable: "Cable",
  "ez barbell": "EZ Bar",
  kettlebell: "Kettlebell",
  band: "Resistance Band",
  "resistance band": "Resistance Band",
  "stability ball": "Exercise Ball",
  "bosu ball": "Exercise Ball",
  "medicine ball": "Medicine Ball",
  "leverage machine": "Machine",
  "smith machine": "Machine",
  assisted: "Machine",
  "elliptical machine": "Machine",
  "stationary bike": "Machine",
  "stepmill machine": "Machine",
  "skierg machine": "Machine",
  "upper body ergometer": "Machine",
  "sled machine": "Machine",
  roller: "Foam Roll",
  hammer: "Other",
  rope: "Other",
  tire: "Other",
  "wheel roller": "Other",
  weighted: "Other",
};

const MUSCLE_MAP = {
  abdominals: "Abdominals",
  abs: "Abdominals",
  core: "Abdominals",
  obliques: "Abdominals",
  "lower abs": "Abdominals",
  abductors: "Abductors",
  adductors: "Adductors",
  groin: "Adductors",
  "inner thighs": "Adductors",
  biceps: "Biceps",
  brachialis: "Biceps",
  calves: "Calves",
  soleus: "Calves",
  shins: "Calves",
  chest: "Chest",
  pectorals: "Chest",
  "upper chest": "Chest",
  "serratus anterior": "Chest",
  forearms: "Forearms",
  "grip muscles": "Forearms",
  "wrist extensors": "Forearms",
  "wrist flexors": "Forearms",
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  lats: "Lats",
  "latissimus dorsi": "Lats",
  "lower back": "Lower Back",
  spine: "Lower Back",
  "middle back": "Middle Back",
  rhomboids: "Middle Back",
  "upper back": "Middle Back",
  back: "Middle Back",
  "levator scapulae": "Middle Back",
  neck: "Neck",
  sternocleidomastoid: "Neck",
  quadriceps: "Quadriceps",
  quads: "Quadriceps",
  shoulders: "Shoulders",
  deltoids: "Shoulders",
  delts: "Shoulders",
  "rotator cuff": "Shoulders",
  "rear deltoids": "Shoulders",
  traps: "Traps",
  trapezius: "Traps",
  triceps: "Triceps",
};

// Source `category` (a body part) -> canonical BodyRegion.
const REGION_BY_CATEGORY = {
  chest: "Chest",
  back: "Back",
  shoulders: "Upper Body",
  "upper arms": "Upper Body",
  "lower arms": "Upper Body",
  neck: "Upper Body",
  "upper legs": "Lower Body",
  "lower legs": "Lower Body",
  waist: "Core",
  cardio: "Cardio",
};

/* ------------------------------------------------------------------ */
/* Heuristic derivations (no difficulty/category in the source)        */
/* ------------------------------------------------------------------ */

// Longer, more specific phrases first so they win over generic substrings.
const CATEGORY_RULES = [
  {
    category: "Strongman",
    words: ["atlas stone", "tire flip", "tire deadlift", "tire slam", "farmer", "yoke walk", "log press", "sandbag", "sledgehammer", "truck pull", "tire"],
  },
  {
    category: "Olympic Weightlifting",
    words: ["clean and jerk", "clean & jerk", "clean and press", "power clean", "power snatch", "hang clean", "hang snatch", "overhead squat", "push press", "muscle snatch", "snatch", "jerk", "thruster"],
  },
  {
    category: "Plyometrics",
    words: ["plyo", "plyometric", "box jump", "depth jump", "tuck jump", "broad jump", "squat jump", "pogo", "bound", "bounding", "explosive"],
  },
  {
    category: "Stretching",
    words: ["stretch", "stretching", "yoga", "mobility", "flexibility", "pigeon", "cobra", "cat-cow", "child", "pose"],
  },
  {
    category: "Cardio",
    words: ["jump rope", "jump-rope", "rope skipping", "skipping", "jumping jack", "mountain climber", "burpee", "high knees", "air bike", "treadmill", "elliptical", "stationary bike", "stair climber", "stair master", "rowing", "rower", "erg", "shuttle run", "bear crawl", "running", "jogging", "sprint", "cycling", "jog", "run"],
  },
];

const DIFFICULTY_RULES = [
  {
    level: "Expert",
    words: ["muscle-up", "muscle up", "planche", "front lever", "back lever", "human flag", "handstand", "pistol", "snatch", "clean and jerk", "clean & jerk", "clean and press", "power clean", "power snatch", "overhead squat", "hang clean", "hang snatch", "one-arm", "one arm", "single-arm", "ring", "olympic", "box jump", "depth jump", "dragon flag", "turkish get-up", "turkish get up", "l-sit", "kipping", "tire flip", "atlas stone", "log press"],
  },
  {
    level: "Beginner",
    words: ["stretch", "stretching", "march", "marching", "walking", "neck", "breathing", "yoga", "plank", "bridge", "mobility", "side bend", "twist", "rotation", "cat-cow", "child", "calf stretch", "hip flexor stretch", "lunge stretch", "butterfly", "pigeon", "cobra", "lying", "seated", "standing", "table", "knee push", "wall", "balance", "glute bridge", "dead bug", "bird dog"],
  },
];

function deriveCategory(name, sourceCategory) {
  if (sourceCategory === "cardio") return "Cardio";
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.words.some((w) => lower.includes(w))) return rule.category;
  }
  return "Strength";
}

function deriveDifficulty(name) {
  const lower = name.toLowerCase();
  for (const rule of DIFFICULTY_RULES) {
    if (rule.words.some((w) => lower.includes(w))) return rule.level;
  }
  return "Intermediate";
}

function deriveTips(category) {
  const tips = [];
  if (category === "Stretching") tips.push("Move slowly and stop at mild tension, never sharp pain.");
  if (category === "Cardio" || category === "Plyometrics") tips.push("Maintain a steady pace and land softly.");
  if (category === "Strength") tips.push("Control the tempo and use smooth, deliberate reps.");
  if (category === "Olympic Weightlifting") tips.push("Keep the bar close and extend the hips explosively.");
  if (category === "Strongman") tips.push("Brace your core and manage fatigue between heavy efforts.");
  tips.push("Focus on full range of motion with smooth form.");
  return tips.slice(0, 3);
}

const STOP_WORDS = new Set(["with", "and", "from", "the", "on", "off", "into", "your"]);
const EQUIPMENT_PREFIX = /^(barbell |dumbbell |cable |ez barbell |ez-?bar |kettlebell |medicine ball |stability ball |bosu ball |body weight |resistance band |band |machine |smith machine |leverage machine |assisted )/i;

function deriveAliases(name, numericId, unmappedMuscles) {
  const lower = name.toLowerCase();
  const stripped = lower
    .replace(/\s*\(.*?\)/g, "")
    .replace(EQUIPMENT_PREFIX, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = stripped
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const candidates = new Set([lower, numericId, stripped, ...unmappedMuscles, tokens.join(" ")]);
  tokens.forEach((t) => candidates.add(t));

  return [...candidates]
    .filter((a) => a && a.length > 1 && a !== lower)
    .slice(0, 6);
}

const mapMuscles = (rawList) =>
  (rawList ?? [])
    .map((m) => String(m).trim().toLowerCase())
    .filter(Boolean)
    .map((m) => MUSCLE_MAP[m])
    .filter((m) => m !== undefined);

const unmappedMuscles = (rawList) =>
  [...new Set((rawList ?? []).map((m) => String(m).trim().toLowerCase()).filter(Boolean))]
    .filter((m) => !MUSCLE_MAP[m]);

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

/**
 * Copies thumbnails + GIFs next to the source JSON into the repo, converts
 * thumbnails to WebP, and rewrites the dataset's image/thumbnail fields to the
 * converted filenames.
 *
 * WebP conversion is gated on `sharp` being installed (npm i -D sharp). It is
 * the reason the repo ships `.webp` thumbnails: ~57% smaller than the source
 * JPGs at q80. Vite's `assetsInlineLimit: 0` (see vite.config.ts) emits them as
 * real files rather than inlining 3KB base64 strings into the JS bundle.
 */
async function copyMedia() {
  const mediaRoot = join(dirname(SOURCE), "..");
  const imagesDir = join(mediaRoot, "images");
  const videosDir = join(mediaRoot, "videos");

  let thumbs = 0;
  let gifs = 0;

  if (existsSync(imagesDir)) {
    mkdirSync(THUMBS_OUT, { recursive: true });
    for (const file of readdirSync(imagesDir)) {
      if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
      copyFileSync(join(imagesDir, file), join(THUMBS_OUT, file));
      thumbs++;
    }
  }

  if (existsSync(videosDir)) {
    mkdirSync(GIFS_OUT, { recursive: true });
    for (const file of readdirSync(videosDir)) {
      if (!/\.gif$/i.test(file)) continue;
      copyFileSync(join(videosDir, file), join(GIFS_OUT, file));
      gifs++;
    }
  }

  console.log(`Media: ${thumbs} thumbnails -> src/assets/exercises/thumbnails/, ${gifs} GIFs -> public/exercises/gifs/`);

  // Convert copied JPG thumbnails to WebP in place, then re-point the dataset
  // at the converted filenames. Safe to skip when sharp isn't installed — the
  // JPGs are already wired and work everywhere.
  let converted = 0;
  try {
    const sharp = (await import("sharp")).default;
    for (const file of readdirSync(THUMBS_OUT)) {
      if (!/\.jpe?g$/i.test(file)) continue;
      const src = join(THUMBS_OUT, file);
      const dst = join(THUMBS_OUT, file.replace(/\.jpe?g$/i, ".webp"));
      await sharp(src).webp({ quality: 80 }).toFile(dst);
      rmSync(src);
      converted++;
    }
    if (converted > 0) {
      const dataset = JSON.parse(readFileSync(OUT, "utf8"));
      for (const exercise of dataset.exercises) {
        if (exercise.image) exercise.image = exercise.image.replace(/\.jpe?g$/i, ".webp");
        if (exercise.thumbnail) exercise.thumbnail = exercise.thumbnail.replace(/\.jpe?g$/i, ".webp");
      }
      writeFileSync(OUT, JSON.stringify(dataset, null, 2));
    }
  } catch (error) {
    console.warn(`WebP conversion skipped: ${error.message}`);
  }

  console.log(
    `Thumbnails converted to WebP: ${converted} (${thumbs - converted} JPGs kept when sharp is unavailable)`
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

const raw = JSON.parse(readFileSync(SOURCE, "utf8"));
const array = Array.isArray(raw) ? raw : raw.exercises;
console.log(`Source: ${array.length} raw exercises from ${SOURCE}`);

// Previous dataset: id lookup by normalized name (case-insensitive).
const oldRaw = JSON.parse(readFileSync(OLD_RAW, "utf8"));
const oldRawArr = Array.isArray(oldRaw) ? oldRaw : (oldRaw.exercises ?? []);
const oldIdByName = new Map();
for (const e of oldRawArr) {
  const key = norm(e.name);
  const oldId = String(e.id ?? "").trim();
  if (oldId && !oldIdByName.has(key)) oldIdByName.set(key, oldId);
}

// Ordering by numeric id keeps dedupe deterministic. Among duplicate names we
// prefer the richer entry (more instruction steps, then more secondary muscles).
const sorted = [...array].sort((a, b) => String(a.id).localeCompare(String(b.id), "en", { numeric: true }));

const richness = (entry) =>
  (entry.instruction_steps?.en?.length ?? 0) * 10 + (entry.secondary_muscles?.length ?? 0);

const deduped = [];
const seenNames = new Map(); // norm(name) -> { entry, rich }
let droppedDupes = 0;

for (const entry of sorted) {
  const rawName = String(entry.name ?? "").trim();
  if (!rawName) continue;
  const nameKey = norm(rawName);
  const rich = richness(entry);
  const existing = seenNames.get(nameKey);
  if (existing) {
    droppedDupes++;
    if (rich > existing.rich) seenNames.set(nameKey, { entry, rich });
    continue;
  }
  seenNames.set(nameKey, { entry, rich });
}
for (const { entry } of seenNames.values()) deduped.push(entry);

const exercises = [];
const seenIds = new Set();
let reusedIds = 0;

for (const entry of deduped) {
  const rawName = String(entry.name ?? "").trim();
  const nameKey = norm(rawName);
  const name = titleCase(rawName);
  const existingId = oldIdByName.get(nameKey);
  let id = existingId ?? slugify(name);

  if (seenIds.has(id)) {
    // slug collision between two distinct names — disambiguate deterministically
    let candidate = id;
    let n = 2;
    while (seenIds.has(candidate)) candidate = `${id}_${n++}`;
    id = candidate;
  }
  if (existingId) reusedIds++;
  seenIds.add(id);

  const sourceCategory = String(entry.category ?? "").trim().toLowerCase();
  const bodyRegion = REGION_BY_CATEGORY[sourceCategory] ?? "Full Body";
  const category = deriveCategory(rawName, sourceCategory);

  const targetMuscles = mapMuscles([entry.target]);
  const secondaryMuscles = [
    ...mapMuscles(entry.secondary_muscles),
    ...mapMuscles([entry.muscle_group]),
  ];
  const extraAliases = [
    ...unmappedMuscles([entry.target]),
    ...unmappedMuscles(entry.secondary_muscles),
    ...unmappedMuscles([entry.muscle_group]),
  ];

  const image = entry.image ? String(entry.image).split("/").pop() : null;
  const gif = entry.gif_url ? String(entry.gif_url).split("/").pop() : null;

  exercises.push({
    id,
    name,
    aliases: deriveAliases(rawName, String(entry.id), extraAliases),
    category,
    equipment: EQUIPMENT_MAP[String(entry.equipment ?? "").trim().toLowerCase()] ?? "Other",
    primaryMuscles: targetMuscles.length > 0 ? targetMuscles : ["Chest"],
    secondaryMuscles: [...new Set(secondaryMuscles)],
    difficulty: deriveDifficulty(rawName),
    mechanic: null,
    force: null,
    instructions: entry.instruction_steps?.en ?? [],
    tips: deriveTips(category),
    image,
    thumbnail: image,
    gif,
    video: entry.video_url ? String(entry.video_url).split("/").pop() : null,
    bodyRegion,
  });
}

exercises.sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(dirname(OUT), { recursive: true });
const output = {
  version: 2,
  source: "hasaneyldrm/exercises-dataset — data/exercises.json (https://github.com/hasaneyldrm/exercises-dataset)",
  generatedAt: new Date().toISOString().slice(0, 10),
  count: exercises.length,
  exercises,
};
writeFileSync(OUT, JSON.stringify(output, null, 2));

// Migration table: every previous exercise -> new id (or null when removed).
const migrationMap = oldRawArr.map((e) => {
  const newId = exercises.find((n) => norm(n.name) === norm(e.name))?.id ?? null;
  return {
    oldId: String(e.id ?? "").trim(),
    oldName: e.name,
    newId,
    status: newId ? "kept" : "removed",
  };
});
writeFileSync(MIGRATION_OUT, JSON.stringify(migrationMap, null, 2));

const bytes = Buffer.byteLength(JSON.stringify(output)) / 1024;
console.log(
  `Wrote ${exercises.length} exercises -> src/data/exercises.json (${(bytes / 1024).toFixed(1)} MB)`
);
console.log(`  IDs reused from old dataset: ${reusedIds}`);
console.log(`  Duplicate names dropped: ${droppedDupes}`);
console.log(`  Migration table: scripts/migration-map.json (${migrationMap.length} old exercises)`);
console.log(
  `  Category mix: ${JSON.stringify([...new Set(exercises.map((e) => e.category))].sort())}`
);
console.log(
  `  Difficulty mix: ${JSON.stringify([...new Set(exercises.map((e) => e.difficulty))].sort())}`
);
console.log(
  `  Equipment mix: ${JSON.stringify([...new Set(exercises.map((e) => e.equipment))].sort())}`
);

if (WANT_MEDIA) {
  await copyMedia();
}
