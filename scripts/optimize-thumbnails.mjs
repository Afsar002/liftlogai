/**
 * optimize-thumbnails.mjs
 *
 * Converts the bundled exercise thumbnails from JPG to WebP (q80) and rewrites
 * `src/data/exercises.json` so `image`/`thumbnail` point at the .webp files.
 * This is the one-time media optimization (Phase 5); the migration script's
 * `--media` flag performs the same conversion for future re-runs.
 *
 *   node scripts/optimize-thumbnails.mjs
 *
 * Requires `sharp` (a devDependency — `npm i -D sharp`).
 *
 * WebP is ~57% smaller than the source JPGs at q80 for these 180x180
 * thumbnails. Vite's `assetsInlineLimit: 0` (see vite.config.ts) emits them as
 * real cacheable files instead of inlining 3KB base64 strings into the JS
 * bundle.
 */

import { readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const THUMBS_OUT = join(ROOT, "src", "assets", "exercises", "thumbnails");
const OUT = join(ROOT, "src", "data", "exercises.json");

function resolveSharp() {
  const p = join(ROOT, "node_modules", "sharp");
  if (existsSync(join(p, "package.json"))) return createRequire(p)(p);
  throw new Error("sharp is not installed. Run `npm i -D sharp`, then re-run this script.");
}

const sharp = resolveSharp();

const files = readdirSync(THUMBS_OUT).filter((f) => /\.jpe?g$/i.test(f));
console.log(`Converting ${files.length} JPG thumbnails to WebP…`);

let converted = 0;
for (const file of files) {
  const src = join(THUMBS_OUT, file);
  const dst = join(THUMBS_OUT, file.replace(/\.jpe?g$/i, ".webp"));
  await sharp(src).webp({ quality: 80 }).toFile(dst);
  rmSync(src);
  converted++;
}

const dataset = JSON.parse(readFileSync(OUT, "utf8"));
let rewrote = 0;
for (const exercise of dataset.exercises) {
  for (const field of ["image", "thumbnail"]) {
    if (exercise[field] && /\.jpe?g$/i.test(exercise[field])) {
      exercise[field] = exercise[field].replace(/\.jpe?g$/i, ".webp");
      rewrote++;
    }
  }
}
writeFileSync(OUT, JSON.stringify(dataset, null, 2));

console.log(`Converted ${converted} thumbnails to .webp; rewrote ${rewrote} dataset image/thumbnail fields.`);
