import { db } from "../../../database/db";
import type {
  AnalyticsSummary,
  WeeklyVolumePoint,
  StrengthProgressPoint,
  HeatmapDay,
  MonthlyTrend,
} from "../types";

/** Get all workout history from IndexedDB */
export async function getWorkoutHistory() {
  return db.history.toArray();
}

/** Get all personal records from IndexedDB */
export async function getPersonalRecords() {
  return db.personalRecords.toArray();
}

/** Compute analytics summary from history + records */
export async function getSummary(): Promise<AnalyticsSummary> {
  const [history, records] = await Promise.all([
    getWorkoutHistory(),
    getPersonalRecords(),
  ]);

  const totalWorkouts = history.length;
  const totalPRs = records.length;

  const totalVolume = history.reduce(
    (sum, workout) => sum + workout.totalVolume,
    0
  );

  const totalSets = history.reduce((total, workout) => {
    const workoutSets = workout.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.length,
      0
    );
    return total + workoutSets;
  }, 0);

  const totalDuration = history.reduce(
    (sum, workout) => sum + workout.durationMinutes,
    0
  );

  const averageWorkoutDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Favorite exercise by set count
  const exerciseCount = new Map<string, number>();
  history.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exerciseCount.set(
        exercise.exerciseName,
        (exerciseCount.get(exercise.exerciseName) ?? 0) + exercise.sets.length
      );
    });
  });

  let favoriteExercise = "-";
  let maxCount = 0;
  exerciseCount.forEach((count, exercise) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteExercise = exercise;
    }
  });

  // Current streak (consecutive days ending today or yesterday)
  const workoutDays = [
    ...new Set(
      history.map((workout) => workout.completedAt.substring(0, 10))
    ),
  ].sort();

  const dates = workoutDays.map((day) => new Date(day));

  let currentStreak = 0;
  if (dates.length > 0) {
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (true) {
      const found = dates.some((d) => d.getTime() === cursor.getTime());
      if (!found) break;
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Longest streak
  let longestStreak = 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i].getTime() - dates[i - 1].getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  return {
    totalWorkouts,
    totalVolume,
    totalPRs,
    totalSets,
    totalDuration,
    averageWorkoutDuration,
    currentStreak,
    longestStreak,
    favoriteExercise,
  };
}

/** Weekly volume for last 7 days */
export async function getWeeklyVolume(): Promise<WeeklyVolumePoint[]> {
  const history = await getWorkoutHistory();
  const today = new Date();
  const data: WeeklyVolumePoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().substring(0, 10);

    const volume = history
      .filter((w) => w.completedAt.substring(0, 10) === key)
      .reduce((sum, w) => sum + w.totalVolume, 0);

    data.push({
      day: day.toLocaleDateString("en-US", { weekday: "short" }),
      volume,
    });
  }
  return data;
}

/** Strength progress for an exercise (best e1RM per day) */
export async function getStrengthProgress(
  exerciseId: string
): Promise<StrengthProgressPoint[]> {
  const history = await getWorkoutHistory();
  const dayMap = new Map<string, number>();

  history.forEach((workout) => {
    const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exercise) return;

    let best1RM = 0;
    exercise.sets.forEach((set) => {
      const estimated1RM = set.weight * (1 + set.reps / 30);
      if (estimated1RM > best1RM) best1RM = estimated1RM;
    });

    const dayKey = workout.completedAt.substring(0, 10);
    const existing = dayMap.get(dayKey) ?? 0;
    if (best1RM > existing) {
      dayMap.set(dayKey, Number(best1RM.toFixed(1)));
    }
  });

  return [...dayMap.entries()]
    .map(([date, estimated1RM]) => ({ date, estimated1RM }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Unique exercises from history (for selectors) */
export async function getExercises(): Promise<{ id: string; name: string }[]> {
  const history = await getWorkoutHistory();
  const byName = new Map<string, { id: string; name: string }>();

  history.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const norm = exercise.exerciseName.trim().toLowerCase();
      byName.set(norm, {
        id: exercise.exerciseId,
        name: exercise.exerciseName,
      });
    });
  });

  return [...byName.values()];
}

/** Exercise distribution by volume */
export async function getExerciseDistribution(): Promise<
  { name: string; value: number }[]
> {
  const history = await getWorkoutHistory();
  const distribution = new Map<string, number>();

  history.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const exerciseVolume = exercise.sets.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0
      );
      distribution.set(
        exercise.exerciseName,
        (distribution.get(exercise.exerciseName) ?? 0) + exerciseVolume
      );
    });
  });

  return [...distribution.entries()].map(([name, value]) => ({ name, value }));
}

/** Workout heatmap for last 84 days (12 weeks) */
export async function getWorkoutHeatmap(): Promise<HeatmapDay[]> {
  const history = await getWorkoutHistory();
  const workoutCounts = new Map<string, number>();

  history.forEach((workout) => {
    const date = workout.completedAt.substring(0, 10);
    workoutCounts.set(date, (workoutCounts.get(date) ?? 0) + 1);
  });

  const today = new Date();
  const heatmap: HeatmapDay[] = [];

  for (let i = 83; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().substring(0, 10);
    heatmap.push({
      date: key,
      count: workoutCounts.get(key) ?? 0,
    });
  }
  return heatmap;
}

/** Monthly trends */
export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  const history = await getWorkoutHistory();
  const months = new Map<string, MonthlyTrend>();

  history.forEach((workout) => {
    const date = new Date(workout.completedAt);
    const key = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!months.has(key)) {
      months.set(key, { month: key, volume: 0, workouts: 0, duration: 0 });
    }
    const month = months.get(key)!;
    month.volume += workout.totalVolume;
    month.workouts++;
    month.duration += workout.durationMinutes;
  });

  return [...months.values()];
}