interface Props {
  value: string;
}

export default function PreviousPerformance({
  value,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-2.5 dark:bg-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Previous
      </p>
      <p className="text-base font-bold tabular-nums text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
