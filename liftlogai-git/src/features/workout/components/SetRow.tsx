import EditableCell from "./EditableCell";
import { useWorkout } from "../context/WorkoutContext";
import { useRestTimer } from "../context/RestTimerContext";

interface Props {
  exerciseId: string;
  setId: string;

  set: number;
  weight: number;
  reps: number;
  rir: number;
  completed: boolean;
}


export default function SetRow({
  set,
  weight,
  reps,
  exerciseId,
setId,
  rir,
  completed,
}: Props) {
  const { updateSet } = useWorkout();
const{start}= useRestTimer();
  return (
    <div className="grid grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_48px] items-center gap-2 rounded-xl bg-slate-50/90 p-3 text-slate-950 transition-all duration-200 hover:bg-slate-100 dark:bg-zinc-800/70 dark:hover:bg-zinc-800">
      <div className="text-center font-semibold text-slate-950 dark:text-white">
        {set}
      </div>

      <EditableCell
  value={weight}
  onChange={(value) =>
  updateSet(exerciseId, setId, {
    weight: value,
  })
}
/>

<EditableCell
  value={reps}
  onChange={(value) =>
  updateSet(exerciseId, setId, {
    reps: value,
  })
}
/>

<EditableCell
  value={rir}
  onChange={(value) =>
  updateSet(exerciseId, setId, {
    rir: value,
  })
}
/>
      <div className="flex items-center justify-center">
        <input
  type="checkbox"
  checked={completed}
  onChange={(e) => {
    updateSet(exerciseId, setId, {
      completed: e.target.checked,
    });

    if (e.target.checked) {
      start();
    }
  }}
  className="h-5 w-5 accent-green-500"
/>
      </div>
    </div>
  );
}