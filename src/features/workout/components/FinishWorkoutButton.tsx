import { FiCheckCircle } from "react-icons/fi";

interface Props {
  onClick: () => void;
}

/**
 * Signature gradient CTA for ending the session.
 */
export default function FinishWorkoutButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 py-4 text-lg font-bold text-emerald-950 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-400 hover:to-lime-300 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      <FiCheckCircle size={20} aria-hidden="true" />
      Finish Workout
    </button>
  );
}
