import { SettingsRepository } from "../repository/SettingsRepository";
import type { UserSettings, Gender, ActivityLevel, FitnessGoal, WeightUnit } from "../types";
import { DEFAULT_SETTINGS } from "../constants";




export class SettingsService {
  static async getSettings(): Promise<UserSettings> {
    const settings =
      await SettingsRepository.getSettings();

    if (settings) {
      // Merge with defaults to ensure all new fields are present
      // (handles migration from older settings without profile data)
      const merged = { ...DEFAULT_SETTINGS, ...settings };
      if (JSON.stringify(merged) !== JSON.stringify(settings)) {
        await SettingsRepository.saveSettings(merged);
      }
      return merged;
    }

    await SettingsRepository.saveSettings(
      DEFAULT_SETTINGS
    );

    return DEFAULT_SETTINGS;
  }

  static async updateSettings(
    settings: UserSettings
  ) {
    await SettingsRepository.update(settings);
  }

  static async updateWeightUnit(
    unit: WeightUnit
  ) {
    const settings =
      await this.getSettings();

    settings.weightUnit = unit;

    await this.updateSettings(settings);
  }

  static async updateTheme(
    theme: UserSettings["theme"]
  ) {
    const settings =
      await this.getSettings();

    await this.updateSettings({
      ...settings,
      theme,
    });
  }

  static async updateRestTimer(
    seconds: number
  ) {
    const settings =
      await this.getSettings();

    settings.defaultRestTimer = seconds;

    await this.updateSettings(settings);
  }

  static async updateNotifications(
    enabled: boolean
  ) {
    const settings =
      await this.getSettings();

    settings.notifications = enabled;

    await this.updateSettings(settings);
  }

  // --- User profile methods for calorie calculation ---

  static async updateProfile(profile: Partial<UserSettings>): Promise<UserSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...profile };
    await this.updateSettings(updated);
    return updated;
  }

  static async updateAge(age: number): Promise<void> {
    await this.updateProfile({ age });
  }

  static async updateGender(gender: Gender): Promise<void> {
    await this.updateProfile({ gender });
  }

  static async updateHeight(height: number): Promise<void> {
    await this.updateProfile({ height });
  }

  static async updateWeight(weight: number): Promise<void> {
    await this.updateProfile({ weight });
  }

  static async updateActivityLevel(level: ActivityLevel): Promise<void> {
    await this.updateProfile({ activityLevel: level });
  }

  static async updateFitnessGoal(goal: FitnessGoal): Promise<void> {
    await this.updateProfile({ goal });
  }

  static async updateTargetWeight(targetWeight: number): Promise<void> {
    await this.updateProfile({ targetWeight });
  }

  static async updateUsername(username: string): Promise<void> {
    await this.updateProfile({ username });
  }

  static async updateProfilePicture(profilePicture: string): Promise<void> {
    await this.updateProfile({ profilePicture });
  }
}
