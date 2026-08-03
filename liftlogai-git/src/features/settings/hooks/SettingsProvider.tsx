import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { SettingsService } from "../services/SettingsService";
import type { UserSettings, Gender, ActivityLevel, FitnessGoal, WeightUnit } from "../types";

type SettingsContextValue = {
  settings: UserSettings | null;
  refresh: () => Promise<void>;
  updateWeightUnit: (unit: WeightUnit) => Promise<void>;
  updateTheme: (theme: UserSettings["theme"]) => Promise<void>;
  updateRestTimer: (seconds: number) => Promise<void>;
  updateNotifications: (enabled: boolean) => Promise<void>;
  updateProfile: (profile: Partial<UserSettings>) => Promise<UserSettings>;
  updateAge: (age: number) => Promise<void>;
  updateGender: (gender: Gender) => Promise<void>;
  updateHeight: (height: number) => Promise<void>;
  updateWeight: (weight: number) => Promise<void>;
  updateActivityLevel: (level: ActivityLevel) => Promise<void>;
  updateFitnessGoal: (goal: FitnessGoal) => Promise<void>;
  updateTargetWeight: (targetWeight: number) => Promise<void>;
  updateHeightUnit: (heightUnit: "cm" | "ft") => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateProfilePicture: (profilePicture: string) => Promise<void>;
  updateExpertMode: (enabled: boolean) => Promise<void>;
};

const SettingsContext =
  createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<UserSettings | null>(null);

  async function refresh() {
    const data = await SettingsService.getSettings();
    setSettings(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function updateWeightUnit(
    unit: WeightUnit
  ) {
    await SettingsService.updateWeightUnit(unit);
    await refresh();
  }

  async function updateTheme(
    theme: UserSettings["theme"]
  ) {
    await SettingsService.updateTheme(theme);
    await refresh();
  }

  async function updateRestTimer(
    seconds: number
  ) {
    await SettingsService.updateRestTimer(seconds);
    await refresh();
  }

  async function updateNotifications(
    enabled: boolean
  ) {
    await SettingsService.updateNotifications(enabled);
    await refresh();
  }

  async function updateProfile(
    profile: Partial<UserSettings>
  ): Promise<UserSettings> {
    const updated = await SettingsService.updateProfile(profile);
    await refresh();
    return updated;
  }

  async function updateAge(age: number) {
    await SettingsService.updateAge(age);
    await refresh();
  }

  async function updateGender(gender: Gender) {
    await SettingsService.updateGender(gender);
    await refresh();
  }

  async function updateHeight(height: number) {
    await SettingsService.updateHeight(height);
    await refresh();
  }

  async function updateWeight(weight: number) {
    await SettingsService.updateWeight(weight);
    await refresh();
  }

  async function updateActivityLevel(level: ActivityLevel) {
    await SettingsService.updateActivityLevel(level);
    await refresh();
  }

  async function updateFitnessGoal(goal: FitnessGoal) {
    await SettingsService.updateFitnessGoal(goal);
    await refresh();
  }

  async function updateTargetWeight(targetWeight: number) {
    await SettingsService.updateTargetWeight(targetWeight);
    await refresh();
  }

  async function updateHeightUnit(heightUnit: "cm" | "ft") {
    await SettingsService.updateProfile({ heightUnit });
    await refresh();
  }

  async function updateUsername(username: string) {
    await SettingsService.updateUsername(username);
    await refresh();
  }

  async function updateProfilePicture(profilePicture: string) {
    await SettingsService.updateProfilePicture(profilePicture);
    await refresh();
  }

  async function updateExpertMode(enabled: boolean) {
    await SettingsService.updateProfile({ expertMode: enabled });
    await refresh();
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        refresh,
        updateWeightUnit,
        updateTheme,
        updateRestTimer,
        updateNotifications,
        updateProfile,
        updateAge,
        updateGender,
        updateHeight,
        updateWeight,
        updateActivityLevel,
        updateFitnessGoal,
      updateTargetWeight,
      updateHeightUnit,
      updateUsername,
      updateProfilePicture,
      updateExpertMode,
    }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used within a SettingsProvider"
    );
  }

  return context;
}
