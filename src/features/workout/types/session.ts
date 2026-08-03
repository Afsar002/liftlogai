export interface LoggedSet {
  id: string;

  weight: number;

  reps: number;

  rir: number;

  completed: boolean;
}

export interface LoggedExercise {
  id: string;

  exerciseId: string;

  name: string;

  previous?: string;

  primaryMuscle?: string;

  secondaryMuscles?: string[];

  isPR?: boolean;

  prType?: "weight" | "reps" | "volume";

  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;

  workoutName: string;

  startedAt: Date;

  exercises: LoggedExercise[];
}