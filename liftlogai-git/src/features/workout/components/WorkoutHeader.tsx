import { FiClock } from "react-icons/fi";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";
interface Props {
  title: string;
  duration: string;
}

export default function WorkoutHeader({
  title,
  duration,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        <p className="text-zinc-400">
          Today's Workout
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <FiClock />

        <span className="font-semibold text-slate-950 dark:text-white">
          {duration}
        </span>
      </div>
    </div>
  );
}