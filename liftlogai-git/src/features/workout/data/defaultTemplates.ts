import type { TemplateExercise } from "../../../database/types";

export interface DefaultTemplate {
  name: string;
  exercises: TemplateExercise[];
}

export const defaultTemplates: DefaultTemplate[] = [
  {
    name: "Monday",
    exercises: [
      { id: "deadlift", name: "Deadlift", targetSets: 4, targetReps: "5-6", rest: 120 },
      { id: "lat-pulldown", name: "Wide Grip Lat Pulldown", targetSets: 4, targetReps: "10-12", rest: 90 },
      { id: "chest-supported-row", name: "Chest Supported Row", targetSets: 3, targetReps: "10", rest: 90 },
      { id: "seated-cable-row", name: "Seated Cable Row", targetSets: 3, targetReps: "12", rest: 90 },
      { id: "straight-arm-pulldown", name: "Straight Arm Pulldown", targetSets: 3, targetReps: "15", rest: 60 },
      { id: "ez-bar-curl", name: "EZ Bar Curl", targetSets: 3, targetReps: "8-10", rest: 60 },
      { id: "incline-db-curl", name: "Incline Dumbbell Curl", targetSets: 3, targetReps: "10-12", rest: 60 },
      { id: "hammer-curl", name: "Hammer Curl", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "back-extension", name: "Back Extensions", targetSets: 2, targetReps: "15", rest: 60 },
    ],
  },
  {
    name: "Tuesday",
    exercises: [
      { id: "bench-press", name: "Barbell Bench Press", targetSets: 4, targetReps: "6-8", rest: 120 },
      { id: "incline-db", name: "Incline Dumbbell Press", targetSets: 4, targetReps: "8-10", rest: 90 },
      { id: "machine-chest-press", name: "Machine Chest Press", targetSets: 3, targetReps: "10-12", rest: 90 },
      { id: "cable-fly", name: "Cable Fly", targetSets: 3, targetReps: "12-15", rest: 60 },
      { id: "push-ups", name: "Push-ups", targetSets: 2, targetReps: "To failure", rest: 60 },
      { id: "rope-pushdown", name: "Rope Pushdown", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "overhead-rope-extension", name: "Overhead Rope Extension", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "close-grip-bench", name: "Close-Grip Bench Press", targetSets: 3, targetReps: "8-10", rest: 90 },
    ],
  },
  {
    name: "Wednesday",
    exercises: [
      { id: "squat", name: "Barbell Squat", targetSets: 4, targetReps: "6-8", rest: 120 },
      { id: "leg-press", name: "Leg Press", targetSets: 4, targetReps: "10", rest: 90 },
      { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", targetSets: 3, targetReps: "10 each leg", rest: 90 },
      { id: "romanian-deadlift", name: "Romanian Deadlift", targetSets: 3, targetReps: "10", rest: 90 },
      { id: "lying-leg-curl", name: "Lying Leg Curl", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "standing-calf-raise", name: "Standing Calf Raise", targetSets: 4, targetReps: "15", rest: 60 },
      { id: "seated-calf-raise", name: "Seated Calf Raise", targetSets: 3, targetReps: "20", rest: 60 },
    ],
  },
  {
    name: "Thursday",
    exercises: [
      { id: "seated-db-shoulder-press", name: "Seated Dumbbell Shoulder Press", targetSets: 4, targetReps: "8-10", rest: 90 },
      { id: "db-lateral-raise", name: "Dumbbell Lateral Raise", targetSets: 4, targetReps: "12-15", rest: 60 },
      { id: "lateral-raise", name: "Cable Lateral Raise", targetSets: 3, targetReps: "15", rest: 60 },
      { id: "rear-delt-fly", name: "Rear Delt Fly", targetSets: 4, targetReps: "12", rest: 60 },
      { id: "face-pull", name: "Face Pull", targetSets: 3, targetReps: "15", rest: 60 },
      { id: "db-shrugs", name: "Dumbbell Shrugs", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "hanging-leg-raise", name: "Hanging Leg Raise", targetSets: 3, targetReps: "15", rest: 60 },
      { id: "cable-crunch", name: "Cable Crunch", targetSets: 3, targetReps: "15", rest: 60 },
      { id: "plank", name: "Plank", targetSets: 3, targetReps: "60 sec", rest: 60 },
    ],
  },
  {
    name: "Friday",
    exercises: [
      { id: "pull-ups", name: "Pull-ups", targetSets: 4, targetReps: "To failure", rest: 90 },
      { id: "t-bar-row", name: "T-Bar Row", targetSets: 4, targetReps: "8", rest: 90 },
      { id: "single-arm-db-row", name: "Single Arm Dumbbell Row", targetSets: 3, targetReps: "10", rest: 90 },
      { id: "neutral-grip-pulldown", name: "Neutral Grip Pulldown", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "machine-row", name: "Machine Row", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "preacher-curl", name: "Preacher Curl", targetSets: 3, targetReps: "10", rest: 60 },
      { id: "bayesian-cable-curl", name: "Bayesian Cable Curl", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "reverse-curl", name: "Reverse Curl", targetSets: 3, targetReps: "12", rest: 60 },
    ],
  },
  {
    name: "Saturday",
    exercises: [
      { id: "incline-barbell-press", name: "Incline Barbell Press", targetSets: 4, targetReps: "8", rest: 120 },
      { id: "flat-db-press", name: "Flat Dumbbell Press", targetSets: 4, targetReps: "10", rest: 90 },
      { id: "pec-deck-fly", name: "Pec Deck Fly", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "high-to-low-cable-fly", name: "High-to-Low Cable Fly", targetSets: 3, targetReps: "15", rest: 60 },
      { id: "skull-crushers", name: "Skull Crushers", targetSets: 3, targetReps: "10", rest: 60 },
      { id: "rope-pushdown", name: "Rope Pushdown", targetSets: 3, targetReps: "12", rest: 60 },
      { id: "single-arm-cable-extension", name: "Single Arm Cable Extension", targetSets: 3, targetReps: "15", rest: 60 },
    ],
  },
];
