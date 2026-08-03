import type { WorkoutTemplateDB } from "../../../database/types";
import type { WorkoutSession } from "../types/session";
import { HistoryRepository } from "../../history/repositories/HistoryRepository";
import type { WorkoutHistory } from "../../history/models/WorkoutHistory";

export class WorkoutSessionFactory {
  static async create(template: WorkoutTemplateDB): Promise<WorkoutSession> {
    // Fetch workout history to compute previous bests
    let history: WorkoutHistory[] = [];
    try {
      history = await HistoryRepository.getAll();
    } catch (err) {
      console.error('Failed to fetch workout history:', err);
      // Continue with empty history - will show "-" for previous bests
    }

    // Build a map of exerciseId -> previous best string
    const previousBests = computePreviousBests(history, template.exercises.map(e => e.id));

    return {
      id: crypto.randomUUID(),

      workoutName: template.name,

      startedAt: new Date(),

      exercises: template.exercises.map((exercise) => ({
        id: crypto.randomUUID(),

        exerciseId: exercise.id,

        name: exercise.name,

        previous: previousBests.get(exercise.id) || "-",

        sets: Array.from(
          { length: exercise.targetSets },
          () => ({
            id: crypto.randomUUID(),

            weight: 0,

            reps: 0,

            rir: 2,

            completed: false,
          })
        ),
      })),
    };
  }
}

function computePreviousBests(
  history: WorkoutHistory[],
  exerciseIds: string[]
): Map<string, string> {
  const bests = new Map<string, { weight: number; reps: number; volume: number }>();

  // Iterate through history to find the heaviest completed set for each exercise
  // (not just most recent - we want the all-time best)
  for (const workout of history) {
    for (const exercise of workout.exercises) {
      if (!exerciseIds.includes(exercise.exerciseId)) continue;

      // Find the heaviest set (by weight, then reps) in this workout
      // All sets in history are from completed workouts, so no need to check 'completed' flag
      let bestSet = { weight: 0, reps: 0, volume: 0 };
      for (const set of exercise.sets) {
        const volume = set.weight * set.reps;
        if (set.weight > bestSet.weight || (set.weight === bestSet.weight && set.reps > bestSet.reps)) {
          bestSet = { weight: set.weight, reps: set.reps, volume };
        }
      }

      // Only update if we found a valid set and it's better than what we have
      if (bestSet.weight > 0) {
        const existing = bests.get(exercise.exerciseId);
        if (!existing || bestSet.weight > existing.weight || (bestSet.weight === existing.weight && bestSet.reps > existing.reps)) {
          bests.set(exercise.exerciseId, bestSet);
        }
      }
    }
  }

  // Convert to display strings
  const result = new Map<string, string>();
  for (const [exerciseId, best] of bests) {
    // Calculate 1RM using Epley formula: weight * (1 + reps/30)
    const oneRM = Math.round(best.weight * (1 + best.reps / 30));
    result.set(exerciseId, `${best.weight} lbs × ${best.reps} reps (1RM ~${oneRM} lbs)`);
  }

  return result;
}