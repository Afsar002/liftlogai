interface Props {
  value: string;
}

export default function PreviousPerformance({
  value,
}: Props) {
  return (
    <div className="mb-4 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
      <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Previous
      </p>

      <p className="mt-1 text-lg font-semibold text-green-400">
        {value}
      </p>
    </div>
  );
}