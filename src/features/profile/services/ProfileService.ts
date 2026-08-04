import { ProfileRepository } from "../repository/ProfileRepository";
import { HistoryRepository } from "../../history/repositories/HistoryRepository";
import type { WorkoutHistory } from "../../history/models/WorkoutHistory";
import type { ProfileStats } from "../types";

/**
 * Compute the current day streak from workout history.
 * Counts consecutive calendar days ending today or yesterday.
 * Mirrors the logic in HistoryPage's computeStreaks (current only).
 */
function computeCurrentStreak(history: WorkoutHistory[]): number {
  if (history.length === 0) return 0;

  const daySet = new Set<string>();
  for (const workout of history) {
    daySet.add(new Date(workout.completedAt).toISOString().slice(0, 10));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const anchor = daySet.has(today.toISOString().slice(0, 10))
    ? today
    : new Date(today.getTime() - 86400000);

  let streak = 0;
  let cursor = new Date(anchor);
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }

  return streak;
}

export class ProfileService {
  static async getStats(): Promise<ProfileStats> {
    // Fetch templates and workout history in parallel for efficiency.
    const [templates, history] = await Promise.all([
      ProfileRepository.getTemplates(),
      HistoryRepository.getAll(),
    ]);

    const totalMinutes = history.reduce(
      (sum, workout) => sum + workout.durationMinutes,
      0
    );

    // Round to 1 decimal place so 90 min → 1.5h, not 1h or 2h.
    const trainingHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      templateCount: templates.length,

      exerciseCount: templates.reduce(
        (total, template) => total + template.exercises.length,
        0
      ),

      completedWorkouts: history.length,

      trainingHours,

      streak: computeCurrentStreak(history),
    };
  }
}