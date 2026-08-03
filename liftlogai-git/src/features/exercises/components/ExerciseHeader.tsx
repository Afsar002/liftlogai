interface Props {
  name: string;
  sessions: number;
}

export default function ExerciseHeader({
  name,
  sessions,
}: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
        {name}
      </h1>

      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {sessions} workout sessions
      </p>
    </div>
  );
}