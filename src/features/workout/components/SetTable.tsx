import SetHeader from "./SetHeader";
import SetRow from "./SetRow";

import type { LoggedSet } from "../types/session";

interface Props {
  exerciseId: string;
  sets: LoggedSet[];
}

export default function SetTable({
  exerciseId,
  sets,
}: Props) {
  return (
    <div className="space-y-2">
      <SetHeader />

      {sets.map((set, index) => (
        <SetRow
          key={set.id}
          exerciseId={exerciseId}
          setId={set.id}
          set={index + 1}
          weight={set.weight}
          reps={set.reps}
          rir={set.rir}
          completed={set.completed}
        />
      ))}
    </div>
  );
}