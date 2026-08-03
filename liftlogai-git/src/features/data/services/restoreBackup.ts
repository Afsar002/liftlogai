import { db } from "../../../database/db";
import type { BackupFile } from "../types/BackupFile";

export async function restoreBackup(
  backup: BackupFile
): Promise<void> {
  const {
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
  } = backup.database;

  await db.transaction(
    "rw",
    [
      db.templates,
      db.workoutSessions,
      db.history,
      db.personalRecords,
      db.settings,
      db.nutritionProgress,
      db.meals,
      db.mealItems,
      db.foodCache,
      db.favoriteFoods,
    ],
    async () => {
      // Clear existing data
      await Promise.all([
        db.templates.clear(),
        db.workoutSessions.clear(),
        db.history.clear(),
        db.personalRecords.clear(),
        db.settings.clear(),
        db.nutritionProgress.clear(),
        db.meals.clear(),
        db.mealItems.clear(),
        db.foodCache.clear(),
        db.favoriteFoods.clear(),
      ]);

      // Restore data
      if (templates.length) {
        await db.templates.bulkAdd(templates);
      }

      if (workoutSessions.length) {
        await db.workoutSessions.bulkAdd(workoutSessions);
      }

      if (history.length) {
        await db.history.bulkAdd(history);
      }

      if (personalRecords.length) {
        await db.personalRecords.bulkAdd(personalRecords);
      }

      await db.settings.put(settings);

      if (nutritionProgress && nutritionProgress.length) {
        await db.nutritionProgress.bulkAdd(nutritionProgress);
      }

      if (meals && meals.length) {
        await db.meals.bulkAdd(meals);
      }

      if (mealItems && mealItems.length) {
        await db.mealItems.bulkAdd(mealItems);
      }

      if (foodCache && foodCache.length) {
        await db.foodCache.bulkAdd(foodCache);
      }

      if (favoriteFoods && favoriteFoods.length) {
        await db.favoriteFoods.bulkAdd(favoriteFoods);
      }
    }
  );
}
