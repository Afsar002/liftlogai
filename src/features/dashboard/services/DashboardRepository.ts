import { WorkoutRepository } from "../../workout/services/WorkoutRepository";

export interface DashboardStats {
  streak: number;
  lastWorkout?: string;
  lastWorkoutDate?: string;
  workoutsThisWeek: number;
  totalVolume: number;
  averageDuration: number;
}

export class DashboardRepository {
  static async getDashboardStats(): Promise<DashboardStats> {
    const workouts =
      await WorkoutRepository.getWorkoutHistory();

    if (workouts.length === 0) {
      return {
        streak: 0,
        workoutsThisWeek: 0,
        totalVolume: 0,
        averageDuration: 0,
      };
    }

    const totalVolume = workouts.reduce(
      (sum, workout) => sum + workout.totalVolume,
      0
    );

    const averageDuration =
      workouts.reduce(
        (sum, workout) => sum + workout.duration,
        0
      ) / workouts.length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const workoutsThisWeek = workouts.filter(
      (workout) =>
        new Date(workout.finishedAt) >= oneWeekAgo
    ).length;

    const lastWorkout = workouts[0];

    return {
      // Temporary until we build the streak calculator
      streak: workouts.length > 0 ? 1 : 0,

      lastWorkout: lastWorkout.workoutName,

      lastWorkoutDate: lastWorkout.finishedAt,

      workoutsThisWeek,

      totalVolume,

      averageDuration: Math.round(
        averageDuration
      ),
    };
  }
}