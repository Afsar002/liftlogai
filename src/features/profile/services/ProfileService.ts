import { ProfileRepository } from "../repository/ProfileRepository";
import type { ProfileStats } from "../types";

export class ProfileService {
  static async getStats(): Promise<ProfileStats> {
    const templates =
      await ProfileRepository.getTemplates();

    return {
      templateCount: templates.length,

      exerciseCount: templates.reduce(
        (total, template) =>
          total + template.exercises.length,
        0
      ),

      completedWorkouts: 0,

      trainingHours: 0,

      streak: 0,
    };
  }
}