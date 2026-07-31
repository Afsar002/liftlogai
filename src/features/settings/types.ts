export type WeightUnit = "kg" | "lb";

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type Gender = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type FitnessGoal =
  | "maintain"
  | "lose"
  | "gain";

export interface UserSettings {
  id: number;

  weightUnit: WeightUnit;

  defaultRestTimer: number;

  theme: ThemeMode;

  notifications: boolean;

  // User profile for calorie calculation
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  targetWeight: number; // in kg
  heightUnit: "cm" | "ft";

  // User identity
  username: string;
  profilePicture?: string; // base64 encoded image or URL

  // Expert mode for raw ingredient calculation
  expertMode: boolean;
}
