import type { UserSettings } from "./types";

export const DEFAULT_SETTINGS: UserSettings = {
  id: 1,
  weightUnit: "kg",
  defaultRestTimer: 90,
  theme: "dark",
  notifications: true,
  // Default user profile for calorie calculation
  age: 25,
  gender: "male",
  height: 175,
  weight: 70,
  activityLevel: "moderate",
  goal: "maintain",
  targetWeight: 70,
  heightUnit: "cm",
  // User identity
  username: "User",
  // Expert mode for raw ingredient calculation
  expertMode: false,
};
