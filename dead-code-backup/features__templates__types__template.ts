export interface TemplateExercise {
  id: string;
  name: string;

  targetSets: number;
  targetReps: string;
  rest: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;

  exercises: TemplateExercise[];

  createdAt: string;
  updatedAt: string;
}