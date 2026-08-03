import {db} from "../../../database/db";

import { DEFAULT_SETTINGS } from "../../settings/constants";


export async function resetDatabase() {
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

            // Restore default settings
            await db.settings.put(DEFAULT_SETTINGS);
        }
    );
}
