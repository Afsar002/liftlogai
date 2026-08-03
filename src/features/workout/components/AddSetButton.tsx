import { FiPlus } from "react-icons/fi";
import { useWorkout } from "../context/WorkoutContext";

interface Props {
  exerciseId: string;
}

export default function AddSetButton({
  exerciseId,
}: Props) {
  const { addSet } = useWorkout();

  return (
    <button
      onClick={() => addSet(exerciseId)}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-zinc-300 py-3 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-400 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      <FiPlus size={16} aria-hidden="true" />
      Add Set
    </button>
  );
}
