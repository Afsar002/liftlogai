import {
  Difficulty,
  Equipment,
  ExerciseCategory,
  MuscleGroup,
} from "../constants/exercise";

export interface Exercise {
  id: string;

  name: string;

  muscleGroup: MuscleGroup;

  equipment: Equipment;

  category: ExerciseCategory;

  difficulty: Difficulty;

  instructions: string[];

  tips: string[];

  isCustom: boolean;
}

export interface WorkoutSet {
  id: string;

  setNumber: number;

  weight: number;

  reps: number;

  rir: number;

  completed: boolean;

  notes?: string;
}

export interface WorkoutExercise {
  id: string;

  exerciseId: string;

  targetSets: number;

  minReps: number;

  maxReps: number;

  targetRIR: number;

  restSeconds: number;

  sets: WorkoutSet[];
}

export interface WorkoutDay {
  id: string;

  name: string;

  exercises: WorkoutExercise[];
}

export interface Program {
  id: string;

  name: string;

  workoutDays: WorkoutDay[];
}