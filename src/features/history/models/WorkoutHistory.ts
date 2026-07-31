export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: {
    reps: number;
    weight: number;
  }[];
}

export interface WorkoutHistory {
  id?: number;

  templateId: number;

  templateName: string;

  startedAt: string;

  completedAt: string;

  durationMinutes: number;

  totalVolume: number;

  exercises: ExerciseLog[];
}