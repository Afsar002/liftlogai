type Set = {
  weight: number;
  reps: number;
  completed: boolean;
};

type Session = {
  finishedAt: string;
  sets: Set[];
};

type Props = {
  history: Session[];
};

export default function ExerciseHistory({ history }: Props) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 dark:bg-zinc-900">
      <h2 className="mb-5 text-lg font-semibold text-slate-950 dark:text-white">
        Recent Sessions
      </h2>

      <div className="space-y-5">
        {history.map((session, index) => (
          <div
            key={`${session.finishedAt}-${index}`}
            className="border-b border-zinc-200 pb-4 last:border-none dark:border-zinc-800"
          >
            <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
              {new Date(session.finishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>

            <div className="space-y-1">
              {session.sets
                .filter(set => set.completed)
                .map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className="flex justify-between text-sm text-slate-950 dark:text-white"
                  >
                    <span>Set {setIndex + 1}</span>

                    <span className="font-medium">
                      {set.weight} kg × {set.reps}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}