import puppeteer from "puppeteer-core";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = "http://localhost:5173";

const ROUTES = [
  ["/", "dashboard"],
  ["/workout", "workout"],
  ["/analytics", "analytics"],
  ["/history", "history"],
  ["/history/1", "history-detail"],
  ["/profile", "profile"],
  ["/exercises", "exercises"],
  ["/templates", "templates"],
  ["/templates/1/edit", "template-edit"],
  ["/records", "records"],
  ["/meals", "meals"],
  ["/meals/progress", "meals-progress"],
  ["/progress/2026-08-03", "meals-detail"],
];

async function seed(page) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const txDone = (tx) => new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
    const openDb = () => new Promise((res, rej) => { const req = indexedDB.open("LiftLogAI"); req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
    // Wait for the app to finish Dexie migration (stores to exist at v7)
    let db;
    for (let i = 0; i < 40; i++) {
      db = await openDb();
      if (db.objectStoreNames.contains("templates") && db.objectStoreNames.contains("personalRecords")) break;
      db.close();
      await sleep(250);
    }
    const now = new Date().toISOString();

    const s = db.transaction("settings", "readwrite");
    s.objectStore("settings").put({ id: 1, weightUnit: "kg", defaultRestTimer: 90, theme: "dark", notifications: true, age: 27, gender: "male", height: 178, weight: 82, activityLevel: "active", goal: "gain", targetWeight: 85, heightUnit: "cm", username: "Alex Athlete", expertMode: false });
    await txDone(s);

    const h = db.transaction("history", "readwrite");
    h.objectStore("history").put({ id: 1, templateId: 1, templateName: "Push Day", startedAt: new Date(Date.now() - 3600e3).toISOString(), completedAt: now, durationMinutes: 65, totalVolume: 15000, exercises: [
      { exerciseId: "bench-press", exerciseName: "Bench Press", sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 85 }, { reps: 6, weight: 90 }] },
      { exerciseId: "overhead-press", exerciseName: "Overhead Press", sets: [{ reps: 10, weight: 50 }, { reps: 8, weight: 55 }] },
      { exerciseId: "triceps-pushdown", exerciseName: "Triceps Pushdown", sets: [{ reps: 12, weight: 35 }, { reps: 12, weight: 40 }] },
    ] });
    h.objectStore("history").put({ id: 2, templateId: 2, templateName: "Pull Day", startedAt: new Date(Date.now() - 4 * 86400e3).toISOString(), completedAt: new Date(Date.now() - 4 * 86400e3).toISOString(), durationMinutes: 55, totalVolume: 12200, exercises: [
      { exerciseId: "deadlift", exerciseName: "Deadlift", sets: [{ reps: 5, weight: 140 }] },
      { exerciseId: "lat-pulldown", exerciseName: "Lat Pulldown", sets: [{ reps: 10, weight: 60 }] },
      { exerciseId: "barbell-row", exerciseName: "Barbell Row", sets: [{ reps: 8, weight: 70 }] },
    ] });
    await txDone(h);

    const t = db.transaction("templates", "readwrite");
    t.objectStore("templates").put({ id: 1, name: "Push Day", exercises: [
      { id: "bench-press", name: "Bench Press", targetSets: 3, targetReps: "8", rest: 90 },
      { id: "overhead-press", name: "Overhead Press", targetSets: 3, targetReps: "8", rest: 90 },
      { id: "triceps-pushdown", name: "Triceps Pushdown", targetSets: 3, targetReps: "12", rest: 60 },
    ], createdAt: now, updatedAt: now });
    await txDone(t);

    const pr = db.transaction("personalRecords", "readwrite");
    pr.objectStore("personalRecords").put({ id: 1, exerciseId: "bench-press", exerciseName: "Bench Press", weight: 90, reps: 6, estimated1RM: 104, achievedAt: now });
    pr.objectStore("personalRecords").put({ id: 2, exerciseId: "deadlift", exerciseName: "Deadlift", weight: 140, reps: 5, estimated1RM: 158, achievedAt: now });
    await txDone(pr);
  });
}

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const seedPage = await browser.newPage();
  await seedPage.setViewport({ width: 414, height: 896 });
  await seed(seedPage);
  await seedPage.close();

  for (const [route, name] of ROUTES) {
    for (const w of [320, 375, 768]) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: 800 });
      await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 400));
      const file = `shots/${name}-${w}.png`;
      await page.screenshot({ path: file, fullPage: false });
      await page.close();
    }
  }
  console.log("done");
} finally {
  await browser.close();
}
