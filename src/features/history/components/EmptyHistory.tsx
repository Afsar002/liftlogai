export default function EmptyHistory() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
        No Workouts Yet
      </h2>

      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        Complete your first workout to see it
        here.
      </p>
    </div>
  );
}