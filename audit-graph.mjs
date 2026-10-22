import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";

const SRC = resolve(process.argv[2] ?? "src");
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(p)) files.push(p);
  }
})(SRC);

const rel = (p) => relative(SRC, p).replace(/\\/g, "/");
const importsOf = new Map();
const importRe = /(?:from\s*|import\s*\(\s*|import\s*)["']([^"']+)["']/g;

for (const f of files) {
  const src = readFileSync(f, "utf8");
  const deps = [];
  for (const m of src.matchAll(importRe)) {
    const spec = m[1];
    if (!spec.startsWith(".")) continue;
    const abs = resolve(dirname(f), spec);
    const cands = [abs, abs + ".ts", abs + ".tsx", join(abs, "index.ts"), join(abs, "index.tsx")];
    for (const c of cands) {
      if (files.includes(c)) { deps.push(rel(c)); break; }
    }
  }
  importsOf.set(rel(f), deps);
}

// entry points
const entries = ["main.tsx", "app/App.tsx"];
const reachable = new Set();
const queue = [...entries];
while (queue.length) {
  const cur = queue.shift();
  if (reachable.has(cur)) continue;
  reachable.add(cur);
  for (const d of importsOf.get(cur) ?? []) queue.push(d);
}

const all = files.map(rel).sort();
const orphans = all.filter((f) => !reachable.has(f) && f.length > 0);
let deadLines = 0;
console.log("=== UNREACHABLE FROM ENTRY ===");
for (const o of orphans) {
  const n = readFileSync(join(SRC, o), "utf8").split("\n").length;
  deadLines += n;
  console.log("  " + o + "  (" + n + " lines)");
}
console.log(`\nDEAD FILES: ${orphans.length}   DEAD LINES: ${deadLines}`);
console.log(`REACHABLE: ${reachable.size} / ${files.length}`);

// --- unused named imports ---
console.log("\n=== UNUSED IMPORTED BINDINGS ===");
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const importBlockRe = /import\s+(type\s+)?([\s\S]*?)\s+from\s*["'][^"']+["']/g;
  for (const m of src.matchAll(importBlockRe)) {
    const clause = m[2];
    const names = [];
    // default import
    const def = clause.match(/^([A-Za-z_$][\w$]*)/);
    if (def) names.push(def[1]);
    // named imports { a, b as c, type d }
    const braces = clause.match(/\{([\s\S]*?)\}/);
    if (braces) {
      for (const part of braces[1].split(",")) {
        let t = part.trim();
        if (!t) continue;
        t = t.replace(/^type\s+/, ""); // strip inline `type` modifier
        const as = t.split(/\s+as\s+/);
        names.push((as[1] ?? as[0]).trim());
      }
    }
    const body = src.slice(m.index + m[0].length);
    for (const n of names) {
      const re = new RegExp("\\b" + n.replace(/\$/g, "\\$") + "\\b");
      if (!re.test(body)) console.log(`  ${rel(f)}  ->  ${n}`);
    }
  }
}

console.log("\n=== IMPORT COUNTS (least referenced first) ===");
const incoming = new Map(all.map((f) => [f, 0]));
for (const [, deps] of importsOf) for (const d of deps) incoming.set(d, (incoming.get(d) ?? 0) + 1);
for (const [f, c] of [...incoming.entries()].sort((a, b) => a[1] - b[1])) {
  if (c <= 1) console.log(`  ${c}  ${f}`);
}
