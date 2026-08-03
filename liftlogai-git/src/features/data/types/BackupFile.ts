import type { WorkoutHistory } from "../../history/models/WorkoutHistory";

import type { UserSettings } from "../../settings/types";
import type {
  WorkoutSessionDB,
  WorkoutTemplateDB,
  PersonalRecordDB,
} from "../../../database/types";
import type { NutritionProgress, Meal, MealItem, FoodCacheEntry, FavoriteFood } from "../../meals/types";


export const BACKUP_VERSION = 2;

export interface BackupMetadata {
  app: "LiftLog AI";
  version: number;
  exportedAt: string;
}

export interface BackupDatabase {
  workoutSessions: WorkoutSessionDB[];
  templates: WorkoutTemplateDB[];
  history: WorkoutHistory[];
  settings: UserSettings;
  personalRecords: PersonalRecordDB[];
  nutritionProgress: NutritionProgress[];
  meals?: Meal[];
  mealItems?: MealItem[];
  foodCache?: FoodCacheEntry[];
  favoriteFoods?: FavoriteFood[];
}
export interface BackupFile {
  metadata: BackupMetadata;
  database: BackupDatabase;
}
