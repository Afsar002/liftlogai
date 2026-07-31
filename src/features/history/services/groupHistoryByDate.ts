import type { WorkoutHistory } from "../models/WorkoutHistory";
import type { HistoryGroup } from "../types/Historygroup";

export function groupHistoryByDate(
  history: WorkoutHistory[]
): HistoryGroup[] {
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() -
      new Date(a.completedAt).getTime()
  );

  const groups = new Map<string, WorkoutHistory[]>();

  for (const workout of sorted) {
    const key = getGroupTitle(workout.completedAt);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(workout);
  }

  return Array.from(groups, ([title, workouts]) => ({
    title,
    workouts,
  }));
}

function getGroupTitle(dateString: string): string {
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";

  if (diffDays === 1) return "Yesterday";

  if (diffDays < 7) {
    return target.toLocaleDateString("en-US", {
      weekday: "long",
    });
  }

  return target.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}