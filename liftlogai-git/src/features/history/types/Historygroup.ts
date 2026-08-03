import type { WorkoutHistory } from "../models/WorkoutHistory";

export interface HistoryGroup {
  title: string;
  workouts: WorkoutHistory[];
}