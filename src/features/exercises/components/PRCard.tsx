interface Props {
  weight: number;
  reps: number;
}

export default function PRCard({
  weight,
  reps,
}: Props) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-zinc-400">
        Personal Record
      </h2>

      <p className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
        {weight} kg
      </p>

      <p className="text-zinc-600 dark:text-zinc-400">
        × {reps} reps
      </p>
    </div>
  );
}