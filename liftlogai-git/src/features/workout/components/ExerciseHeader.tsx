interface Props {
  name: string;
}

export default function ExerciseHeader({
  name,
}: Props) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-bold">
        {name}
      </h2>
    </div>
  );
}