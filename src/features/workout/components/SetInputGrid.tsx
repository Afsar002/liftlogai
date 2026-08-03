import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FiMaximize, FiTrash2, FiCheck, FiActivity } from "react-icons/fi";
import { useWorkout } from "../context/WorkoutContext";
import { useRestTimer } from "../context/RestTimerContext";
import { cn } from "../../../shared/lib/cn";
import { useState, useRef, useEffect } from "react";

interface Props {
  exerciseId: string;
  sets: Array<{
    id: string;
    weight: number;
    reps: number;
    rir: number;
    completed: boolean;
  }>;
}

function SetInputGrid({ exerciseId, sets }: Props) {
  const { updateSet, deleteSet } = useWorkout();
  const { start } = useRestTimer();
  const reduceMotion = useReducedMotion() ?? false;

  const handleComplete = (setId: string, completed: boolean) => {
    updateSet(exerciseId, setId, { completed });
    if (completed) start();
  };

  return (
    <div className="space-y-2">
      {sets.map((set, index) => (
        <SetRow
          key={set.id}
          exerciseId={exerciseId}
          setId={set.id}
          setNumber={index + 1}
          weight={set.weight}
          reps={set.reps}
          rir={set.rir}
          completed={set.completed}
          onComplete={handleComplete}
          onDelete={() => deleteSet(exerciseId, set.id)}
          updateSet={updateSet}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

interface SetRowProps {
  exerciseId: string;
  setId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  completed: boolean;
  onComplete: (setId: string, completed: boolean) => void;
  onDelete: () => void;
  updateSet: (exerciseId: string, setId: string, changes: { weight?: number; reps?: number; rir?: number; completed?: boolean }) => void;
  reduceMotion: boolean;
}

function SetRow({
  exerciseId,
  setId,
  setNumber,
  weight,
  reps,
  rir,
  completed,
  onComplete,
  onDelete,
  updateSet,
  reduceMotion,
}: SetRowProps) {
  const [showActions, setShowActions] = useState<boolean>(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingReps, setEditingReps] = useState(false);
  const [editingRir, setEditingRir] = useState(false);
  const [localWeight, setLocalWeight] = useState(String(weight));
  const [localReps, setLocalReps] = useState(String(reps));
  const [localRir, setLocalRir] = useState(String(rir));

  const saveWeight = () => {
    const val = Number(localWeight);
    updateSet(exerciseId, setId, { weight: Number.isNaN(val) ? 0 : val });
    setEditingWeight(false);
  };

  const saveReps = () => {
    const val = Number(localReps);
    updateSet(exerciseId, setId, { reps: Number.isNaN(val) ? 0 : val });
    setEditingReps(false);
  };

  const saveRir = () => {
    const val = Number(localRir);
    updateSet(exerciseId, setId, { rir: Number.isNaN(val) ? 0 : val });
    setEditingRir(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, save: () => void, nextEdit?: () => void) => {
    if (e.key === "Enter") {
      save();
      nextEdit?.();
    } else if (e.key === "Escape") {
      if (editingWeight) { setLocalWeight(String(weight)); setEditingWeight(false); }
      if (editingReps) { setLocalReps(String(reps)); setEditingReps(false); }
      if (editingRir) { setLocalRir(String(rir)); setEditingRir(false); }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={showActions ? "expanded" : "default"}
        layout
        initial={reduceMotion ? false : { x: showActions ? 80 : 0 }}
        animate={{ x: showActions ? 80 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative"
      >
        <div
          className={cn(
            "grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-2 rounded-2xl px-2.5 py-2.5 transition-all duration-200",
            completed
              ? "bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-500/20"
              : "bg-zinc-50/50 hover:bg-zinc-100/80 dark:bg-white/3 dark:hover:bg-white/6 border border-zinc-200/50 dark:border-white/5"
          )}
          onMouseLeave={() => setShowActions(false)}
          onTouchEnd={() => setShowActions(false)}
        >
          {/* Set Number */}
          <motion.div
            layout
            className={cn(
              "flex h-11 w-11 items-center justify-center justify-self-center rounded-xl text-sm font-extrabold tabular-nums",
              completed
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm"
                : "bg-zinc-200/70 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            )}
          >
            {setNumber}
          </motion.div>

          {/* Weight Input */}
          <SetInput
            value={weight}
            localValue={localWeight}
            editing={editingWeight}
            setLocalValue={setLocalWeight}
            onSave={saveWeight}
            onEditToggle={() => setEditingWeight(!editingWeight)}
            onKeyDown={(e) => handleKeyDown(e, saveWeight, () => setEditingReps(true))}
            label="Kg"
            reduceMotion={reduceMotion}
          />

          {/* Reps Input */}
          <SetInput
            value={reps}
            localValue={localReps}
            editing={editingReps}
            setLocalValue={setLocalReps}
            onSave={saveReps}
            onEditToggle={() => setEditingReps(!editingReps)}
            onKeyDown={(e) => handleKeyDown(e, saveReps, () => setEditingRir(true))}
            label="Reps"
            reduceMotion={reduceMotion}
          />

          {/* RIR Input */}
          <SetInput
            value={rir}
            localValue={localRir}
            editing={editingRir}
            setLocalValue={setLocalRir}
            onSave={saveRir}
            onEditToggle={() => setEditingRir(!editingRir)}
            onKeyDown={(e) => handleKeyDown(e, saveRir)}
            label="RIR"
            reduceMotion={reduceMotion}
          />

          {/* Complete Checkbox */}
          <motion.button
            onClick={() => onComplete(setId, !completed)}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            className="flex h-11 w-11 items-center justify-center justify-self-center rounded-xl transition-all"
            aria-label={completed ? `Mark set ${setNumber} incomplete` : `Mark set ${setNumber} complete`}
          >
            <motion.div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                completed
                  ? "bg-emerald-500"
                  : "bg-zinc-200/70 dark:bg-white/10"
              )}
            >
              {completed && (
                <FiCheck size={12} className="text-white" aria-hidden="true" />
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* Swipe Actions — only mounted and interactive while revealed */}
        {showActions && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 pointer-events-none"
          >
            <motion.button
              onClick={onDelete}
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors pointer-events-auto"
              aria-label="Delete set"
            >
              <FiTrash2 size={18} />
            </motion.button>
            <motion.button
              onClick={() => updateSet(exerciseId, setId, { weight: Math.round(weight * 1.025 * 10) / 10 })} // Small increment for plate calc
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors pointer-events-auto"
              aria-label="Quick add weight"
            >
              <FiMaximize size={18} />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

interface SetInputProps {
  value: number;
  localValue: string;
  editing: boolean;
  setLocalValue: (val: string) => void;
  onSave: () => void;
  onEditToggle: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  label: string;
  reduceMotion: boolean;
}

function SetInput({
  value,
  localValue,
  editing,
  setLocalValue,
  onSave,
  onEditToggle,
  onKeyDown,
  label,
  reduceMotion,
}: SetInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative"
      >
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={onSave}
          onKeyDown={onKeyDown}
          className="w-full rounded-xl border-2 border-emerald-500 bg-white px-3 py-2 text-center text-base font-extrabold tabular-nums text-zinc-950 shadow-sm outline-none dark:bg-[#141417] dark:text-white dark:border-emerald-400"
          aria-label={label}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 pointer-events-none">
          {label}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={onEditToggle}
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className="w-full rounded-xl bg-zinc-100/80 px-3 py-2.5 text-center text-base font-extrabold tabular-nums text-zinc-950 transition-all hover:bg-zinc-200 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
      aria-label={`Edit ${label}`}
    >
      {value || <span className="text-zinc-400 dark:text-zinc-500">—</span>}
    </motion.button>
  );
}

export default SetInputGrid;