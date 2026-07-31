export interface WorkoutSessionDB {
  id?: number;

  workoutName: string;

  startedAt: string;

  finishedAt: string;

  duration: number;

  exercises: WorkoutSessionExercise[];

  totalSets: number;

  completedSets: number;

  totalVolume: number;
}

export interface PersonalRecordDB {
  id?: number;

  exerciseId: string;
  exerciseName: string;

  weight: number;
  reps: number;

  estimated1RM: number;

  achievedAt: string;
}
export interface TemplateExercise {
  id: string;
  name: string;

  targetSets: number;
  targetReps: string;
  rest: number;
}

export interface WorkoutTemplateDB {
  id?: number;

  name: string;

  exercises: TemplateExercise[];

  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseDB {
  id: string;
  name: string;
  muscle?: string;
  equipment?: string;
  createdAt?: string;
}

