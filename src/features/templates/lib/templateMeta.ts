import type { TemplateExercise } from "../../../database/types";

/**
 * Presentational heuristics for the program cards. These are display-only
 * estimates derived from the template shape — they never touch saved data.
 */

export function estimateDuration(exercises: TemplateExercise[]): string {
  if (exercises.length === 0) return "—";
  const restSeconds = exercises.reduce((sum, ex) => sum + ex.rest * ex.targetSets, 0);
  const liftMinutes = exercises.reduce((sum, ex) => sum + ex.targetSets * 1.25, 0);
  const total = Math.round((restSeconds / 60) * 0.6 + liftMinutes);
  if (total < 60) return `${Math.max(total, 5)} min`;
  return `${Math.floor(total / 60)}h ${total % 60}m`;
}

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export function difficultyFor(exercises: TemplateExercise[]): Difficulty {
  const count = exercises.length;
  if (count <= 4) return "Beginner";
  if (count <= 8) return "Intermediate";
  return "Advanced";
}

const MUSCLE_RULES: [RegExp, string][] = [
  [/squat|leg press|leg ext|lunge|quad/i, "Legs"],
  [/deadlift|leg curl|hamstring/i, "Hamstrings"],
  [/bench|press|fly|chest|push.?up/i, "Chest"],
  [/row|pull.?up|lat|back|chin.?up/i, "Back"],
  [/shoulder|ohp|military|delt|overhead/i, "Shoulders"],
  [/curl|bicep/i, "Biceps"],
  [/tricep|skull|cable ext/i, "Triceps"],
  [/crunch|plank|sit.?up|ab/i, "Core"],
  [/calf/i, "Calves"],
];

export function muscleGroups(exercises: TemplateExercise[]): string[] {
  const seen = new Set<string>();
  for (const exercise of exercises) {
    for (const [pattern, muscle] of MUSCLE_RULES) {
      if (pattern.test(exercise.name)) {
        seen.add(muscle);
        break;
      }
    }
    if (seen.size >= 3) break;
  }
  return Array.from(seen);
}

export function totalSets(exercises: TemplateExercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
}
