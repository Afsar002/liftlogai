interface Props {
  name: string;
}

export default function ExerciseHeader({
  name,
}: Props) {
  return (
    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
      {name}
    </h2>
  );
}
