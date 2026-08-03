export interface AnalyticsSummary {
  totalWorkouts: number;

  totalVolume: number;

  totalSets: number;

  totalDuration: number;

  averageWorkoutDuration: number;

  currentStreak: number;

  longestStreak: number;

  favoriteExercise: string;

  totalPRs: number;
}
export interface WeeklyVolumePoint {
  day: string;

    volume: number;
}

export interface StrengthProgressPoint {
  date: string;
    estimated1RM: number;
}


export interface HeatmapDay {
  date: string;
  count: number;
}


export interface MonthlyTrend {
  month: string;
  volume: number;
  workouts: number;
  duration: number;
}