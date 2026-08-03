import Dexie, { type Table } from "dexie";


import type {
  WorkoutSessionDB,

  PersonalRecordDB,

  WorkoutTemplateDB,
} from "./types";
import type { ExerciseDB } from "./types";

import type { WorkoutHistory } from "../features/history/models/WorkoutHistory";
import type { UserSettings } from "../features/settings/types";
import type { Meal, MealItem, FoodCacheEntry, FavoriteFood, DailyCalorieGoal, NutritionProgress } from "../features/meals/types";



export class LiftLogDatabase extends Dexie {
  workoutSessions!: Table<WorkoutSessionDB>;

  personalRecords!: Table<PersonalRecordDB,number>;

  templates!: Table<WorkoutTemplateDB>;
  exercises!: Table<ExerciseDB, string>;

  history!: Table<WorkoutHistory>;

  settings!: Table<UserSettings>;

  // Meals feature tables
  meals!: Table<Meal, string>;
  mealItems!: Table<MealItem, string>;
  foodCache!: Table<FoodCacheEntry, string>;
  favoriteFoods!: Table<FavoriteFood, string>;
  dailyCalorieGoal!: Table<DailyCalorieGoal, number>;
  nutritionProgress!: Table<NutritionProgress, string>;

  constructor() {
    super("LiftLogAI");

    this.version(7).stores({
  workoutSessions:
    "++id, workoutName, startedAt, finishedAt",

  personalRecords:
    "++id, exerciseId",

  templates:
    "++id, name",
  exercises: "id, name",
  history:
    "++id, completedAt, templateId",

  settings :
        "id",

  meals: "id, date, mealType",
  mealItems: "id, mealId, foodId",
  foodCache: "id, name, lastUsed",
  favoriteFoods: "id, foodId, name",
  dailyCalorieGoal: "id",
  nutritionProgress: "id, date",
}).upgrade(async (tx) => {
  // Seed default calorie goal
  const goal = await tx.table("dailyCalorieGoal").get(1);
  if (!goal) {
    await tx.table("dailyCalorieGoal").put({ id: 1, goal: 2000 });
  }
});
  }
}
export const db = new LiftLogDatabase();
