import type { LoggedExercise } from "../../../types/session";

interface Props {
  exercise: LoggedExercise;
}

export default function ExerciseCard({ exercise }: Props) {
  return (
    <div className="rounded-xl bg-white border border-zinc-200 p-4 dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="font-semibold text-slate-950 dark:text-white">{exercise.name}</h2>

      {exercise.previous && (
        <p className="text-sm text-green-600 dark:text-green-300">
          Previous: {exercise.previous}
        </p>
      )}
    </div>
  );
}