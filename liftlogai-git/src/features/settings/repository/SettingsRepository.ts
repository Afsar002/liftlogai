import { db } from "../../../database/db";
import type { UserSettings } from "../types";

export class SettingsRepository {
  static async getSettings() {
    return db.settings.get(1);
  }

  static async saveSettings(
    settings: UserSettings
  ) {
    return db.settings.put(settings);
  }

  static async update(
    settings: UserSettings
  ) {
    return db.settings.put(settings);
  }
}