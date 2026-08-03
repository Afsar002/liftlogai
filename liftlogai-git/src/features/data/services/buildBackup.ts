import { db } from "../../../database/db";

import {
  BACKUP_VERSION,
  type BackupFile,
} from "../types/BackupFile";

export async function buildBackup(): Promise<BackupFile> {
 const [
   templates,
   workoutSessions,
   history,
   personalRecords,
   settings,
   nutritionProgress,
   meals,
   mealItems,
   foodCache,
   favoriteFoods,
 ] = await Promise.all([
   db.templates.toArray(),
   db.workoutSessions.toArray(),
   db.history.toArray(),
   db.personalRecords.toArray(),
   db.settings.get(1),
   db.nutritionProgress.toArray(),
   db.meals.toArray(),
   db.mealItems.toArray(),
   db.foodCache.toArray(),
   db.favoriteFoods.toArray(),
 ]);

 if (!settings) {
   throw new Error("Application settings not found.");
 }

 return {
   metadata: {
     app: "LiftLog AI",
     version: BACKUP_VERSION,
     exportedAt: new Date().toISOString(),
   },

   database: {
     templates,
     workoutSessions,
     history,
     personalRecords,
     settings,
     nutritionProgress,
     meals,
     mealItems,
     foodCache,
     favoriteFoods,
   },
 };
}
