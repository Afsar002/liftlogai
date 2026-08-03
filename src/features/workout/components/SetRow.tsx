import EditableCell from "./EditableCell";
import { useWorkout } from "../context/WorkoutContext";
import { useRestTimer } from "../context/RestTimerContext";
import { cn } from "../../../shared/lib/cn";

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
  const { start } = useRestTimer();

  return (
    <div
      className={cn(
        "grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 rounded-2xl px-2.5 py-2 transition-colors",
        completed
          ? "bg-emerald-50 dark:bg-emerald-500/10"
          : "bg-zinc-50 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/8"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center justify-self-center rounded-full text-sm font-bold tabular-nums",
          completed
            ? "bg-emerald-500 text-white"
            : "bg-zinc-200/70 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
        )}
      >
        {set}
      </div>

      <EditableCell
        value={weight}
        onChange={(value) =>
          updateSet(exerciseId, setId, { weight: value })
        }
      />

      <EditableCell
        value={reps}
        onChange={(value) =>
          updateSet(exerciseId, setId, { reps: value })
        }
      />

      <EditableCell
        value={rir}
        onChange={(value) =>
          updateSet(exerciseId, setId, { rir: value })
        }
      />

      <div className="flex items-center justify-center">
        <label className="flex h-11 w-11 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            aria-label={
              completed
                ? `Mark set ${set} incomplete`
                : `Mark set ${set} complete`
            }
            checked={completed}
            onChange={(e) => {
              updateSet(exerciseId, setId, {
                completed: e.target.checked,
              });
              if (e.target.checked) {
                start();
              }
            }}
            className="h-5 w-5 rounded accent-emerald-600"
          />
        </label>
      </div>
    </div>
  );
}
