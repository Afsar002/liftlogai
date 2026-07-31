import Card from "../../../shared/components/ui/Card";

interface Props {
  exercise: string;
  weight: number;
  reps: number;
  estimated1RM: number;
}

export default function PRCard({
  exercise,
  weight,
  reps,
  estimated1RM,
}: Props) {
  return (
    <Card>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            {exercise}
          </h2>

          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-semibold text-yellow-700 dark:text-yellow-300">
            🏆 PR
          </span>
        </div>

        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
          {weight} kg × {reps}
        </p>

        <p className="text-zinc-600 dark:text-zinc-400">
          Estimated 1RM:{" "}
          <span className="font-semibold text-slate-950 dark:text-white">
            {estimated1RM.toFixed(1)} kg
          </span>
        </p>
      </div>
    </Card>
  );
}