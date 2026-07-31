export interface LoggedSet {
  id: string;

  setNumber: number;

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

  completed: boolean;

  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;

  workoutName: string;

  startedAt: Date;

  finishedAt?: Date;

  exercises: LoggedExercise[];
}