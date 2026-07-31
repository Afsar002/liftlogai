interface Props {
  onClick: () => void;
}

export default function FinishWorkoutButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-black transition hover:bg-green-400"
    >
      Finish Workout
    </button>
  );
}