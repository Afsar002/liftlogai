import puppeteer from "puppeteer-core";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = "http://localhost:5173";

const ROUTES = [
  ["/", "Dashboard"],
  ["/workout", "Workout"],
  ["/analytics", "Analytics"],
  ["/history", "History"],
  ["/history/1", "HistoryDetail"],
  ["/profile", "Profile"],
  ["/exercises", "ExerciseLibrary"],
  ["/templates", "Templates"],
  ["/templates/1/edit", "TemplateEditor"],
  ["/records", "Records"],
  ["/meals", "Meals"],
  ["/meals/progress", "ProgressHistory"],
  ["/progress/2026-08-03", "ProgressDetail"],
];

const WIDTHS = [320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1440, 1920];

async function seed(page) {
  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 40000 });
  await page.evaluate(async () => {
    const txDone = (tx) =>
      new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
        tx.onabort = () => rej(tx.error);
      });
    const openDb = () =>
      new Promise((res, rej) => {
        const req = indexedDB.open("LiftLogAI");
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    const db = await openDb();
    const now = new Date().toISOString();

    const s = db.transaction("settings", "readwrite");
    s.objectStore("settings").put({
      id: 1, weightUnit: "kg", defaultRestTimer: 90, theme: "dark",
      notifications: true, age: 27, gender: "male", height: 178, weight: 82,
      activityLevel: "active", goal: "gain", targetWeight: 85, heightUnit: "cm",
      username: "Alex Athlete", expertMode: false,
    });
    await txDone(s);

    const h = db.transaction("history", "readwrite");
    const mkEx = (id, name, w, r) => ({ exerciseId: id, exerciseName: name, sets: [{ weight: w, reps: r }] });
    h.objectStore("history").put({
      templateId: 1, templateName: "Push Day",
      startedAt: new Date(Date.now() - 3600e3).toISOString(), completedAt: now,
      durationMinutes: 65, totalVolume: 15000,
      exercises: [
        { exerciseId: "bench-press", exerciseName: "Bench Press", sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 85 }, { reps: 6, weight: 90 }] },
        { exerciseId: "overhead-press", exerciseName: "Overhead Press", sets: [{ reps: 10, weight: 50 }, { reps: 8, weight: 55 }] },
        { exerciseId: "triceps-pushdown", exerciseName: "Triceps Pushdown", sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 40 }] },
      ],
    });
    // A second workout a few days back so analytics/weekly charts have data
    h.objectStore("history").put({
      templateId: 2, templateName: "Pull Day",
      startedAt: new Date(Date.now() - 4 * 86400e3).toISOString(),
      completedAt: new Date(Date.now() - 4 * 86400e3).toISOString(),
      durationMinutes: 55, totalVolume: 12200,
      exercises: [
        mkEx("deadlift", "Deadlift", 140, 5),
        mkEx("lat-pulldown", "Lat Pulldown", 60, 10),
        mkEx("barbell-row", "Barbell Row", 70, 8),
      ],
    });
    await txDone(h);

    const t = db.transaction("templates", "readwrite");
    t.objectStore("templates").put({
      name: "Push Day",
      exercises: [
        { id: "bench-press", name: "Bench Press", targetSets: 3, targetReps: "8", rest: 90 },
        { id: "overhead-press", name: "Overhead Press", targetSets: 3, targetReps: "8", rest: 90 },
        { id: "triceps-pushdown", name: "Triceps Pushdown", targetSets: 3, targetReps: "12", rest: 60 },
      ],
      createdAt: now, updatedAt: now,
    });
    await txDone(t);

    const pr = db.transaction("personalRecords", "readwrite");
    pr.objectStore("personalRecords").put({ exerciseId: "bench-press", exerciseName: "Bench Press", weight: 90, reps: 6, estimated1RM: 104, achievedAt: now });
    pr.objectStore("personalRecords").put({ exerciseId: "deadlift", exerciseName: "Deadlift", weight: 140, reps: 5, estimated1RM: 158, achievedAt: now });
    await txDone(pr);
  });
}

async function measureOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const vw = window.innerWidth;
    const overflowX = doc.scrollWidth - doc.clientWidth;
    const offenders = [];

    const isClippedByAncestor = (el) => {
      let n = el.parentElement;
      while (n) {
        const ov = getComputedStyle(n).overflowX;
        if (ov === "hidden" || ov === "clip" || ov === "scroll" || ov === "auto") return true;
        n = n.parentElement;
      }
      return false;
    };

    const all = document.querySelectorAll("body *");
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (r.right > vw + 2 || r.left < -2) {
        if (isClippedByAncestor(el)) continue;
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className || "").slice(0, 70),
          overflow: Math.round(Math.max(r.right - vw, -r.left)),
          text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
        });
      }
    }
    offenders.sort((a, b) => b.overflow - a.overflow);
    return { overflowX, offenders: offenders.slice(0, 5) };
  });
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const results = [];
try {
  const seedPage = await browser.newPage();
  await seedPage.setViewport({ width: 414, height: 896 });
  await seed(seedPage);
  await seedPage.close();

  for (const [route, name] of ROUTES) {
    const page = await browser.newPage();
    for (const w of WIDTHS) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 40000 });
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 400));
      const m = await measureOverflow(page);
      if (m.overflowX > 0) {
        results.push({ name, route, w, overflowX: m.overflowX, offenders: m.offenders });
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

if (results.length === 0) {
  console.log("✓ NO HORIZONTAL OVERFLOW at any breakpoint on any page");
} else {
  console.log("✗ HORIZONTAL OVERFLOW FOUND:\n");
  const byPage = new Map();
  for (const r of results) {
    if (!byPage.has(r.name)) byPage.set(r.name, []);
    byPage.get(r.name).push(r);
  }
  for (const [name, rows] of byPage) {
    console.log(`\n== ${name} ==`);
    for (const r of rows) {
      console.log(`   @${r.w}px → overflowX=${r.overflowX}px`);
      for (const o of r.offenders) {
        console.log(`      <${o.tag} class="${o.cls}"> "${o.text}" (+${o.overflow}px)`);
      }
    }
  }
}
