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
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-green-500 py-3 text-green-400 transition hover:bg-green-500/10"
    >
      <FiPlus />
      Add Set
    </button>
  );
}