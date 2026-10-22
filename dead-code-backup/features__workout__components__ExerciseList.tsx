import ExerciseCard from "./ExerciseCard";
import type { LoggedExercise } from "../../../types/session";

interface Props {
  exercises: LoggedExercise[];
}

export default function ExerciseList({ exercises }: Props) {
  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
        />
      ))}
    </div>
  );
}