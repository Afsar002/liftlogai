import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiTrash2, FiPlus, FiMinus, FiAward, FiTrendingUp } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";
import SetInputGrid from "./SetInputGrid";
import type { LoggedExercise } from "../types/session";
import { useWorkout } from "../context/WorkoutContext";

interface Props {
  exercise: LoggedExercise;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onOpenGuide: () => void;
}

const PLATE_STEPS = [2.5, 5, 10];

/**
 * Per-exercise logger card. Expanded: header + previous-reference + set grid +
 * quick weight chips. Collapsed: a compact done-summary strip so finished
 * exercises recede and the active one stays in focus (Hevy-style flow).
 */
export default function ExerciseLoggerCard({
  exercise,
  index,
  expanded,
  onToggle,
  onRemove,
  onOpenGuide,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { updateSet, addSet } = useWorkout();

  const completedSets = exercise.sets.filter((set) => set.completed).length;
  const done = exercise.sets.length > 0 && completedSets === exercise.sets.length;
  const volume = exercise.sets
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + set.weight * set.reps, 0);

  const bumpWeight = (delta: number) => {
    // Apply the bump to the first uncompleted set (the one being worked now).
    const target = exercise.sets.find((set) => !set.completed);
    if (!target) return;
    updateSet(exercise.id, target.id, {
      weight: Math.max(0, Math.round((target.weight + delta) * 10) / 10),
    });
  };

  return (
    <motion.section
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors",
        expanded
          ? "border-zinc-200/80 bg-white shadow-card dark:border-white/8 dark:bg-[#141417]"
          : "border-zinc-200/60 bg-white/60 dark:border-white/6 dark:bg-[#141417]/60"
      )}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums",
            done
              ? "bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950"
              : expanded
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400"
          )}
        >
          {done ? "✓" : index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-zinc-950 dark:text-white">
            {exercise.name}
          </h3>
          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {done
              ? `${exercise.sets.length} sets · ${volume.toLocaleString()} kg`
              : `${completedSets}/${exercise.sets.length} sets done`}
          </p>
        </div>

        {exercise.isPR && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <FiAward size={11} aria-hidden="true" />
            PR
          </span>
        )}

        <motion.span
          animate={reduceMotion ? undefined : { rotate: expanded ? 180 : 0 }}
          transition={spring}
          className={cn("shrink-0 text-zinc-400 dark:text-zinc-500", !done && expanded && "hidden")}
        >
          <FiChevronDown size={16} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              {/* Previous reference + guide + remove */}
              <div className="flex items-center gap-2">
                {exercise.previous && exercise.previous !== "-" ? (
                  <span
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-xs",
                      exercise.isPR
                        ? "border border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400"
                    )}
                  >
                    {exercise.isPR ? (
                      <FiAward size={13} className="shrink-0 text-amber-500" aria-hidden="true" />
                    ) : (
                      <FiTrendingUp size={13} className="shrink-0 text-zinc-400" aria-hidden="true" />
                    )}
                    <span className="shrink-0 font-semibold uppercase tracking-wider">Last:</span>
                    <span className="truncate font-extrabold tabular-nums text-zinc-950 dark:text-white">
                      {exercise.previous}
                    </span>
                    {exercise.prType && (
                      <span className="ml-auto shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                        {exercise.prType}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
                    <FiTrendingUp size={13} className="shrink-0 text-zinc-400" aria-hidden="true" />
                    No previous data
                  </span>
                )}

                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="shrink-0 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
                >
                  Guide
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label={`Remove ${exercise.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/10"
                >
                  <FiTrash2 size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Sets */}
              <SetInputGrid exerciseId={exercise.id} sets={exercise.sets} />

              {/* Quick weight chips + add set */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Quick+
                  </span>
                  {PLATE_STEPS.map((step) => (
                    <motion.button
                      key={step}
                      type="button"
                      onClick={() => bumpWeight(step)}
                      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                      transition={spring}
                      className="flex h-7 items-center gap-0.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 text-[11px] font-bold tabular-nums text-zinc-700 transition-colors hover:border-emerald-400 hover:text-emerald-700 dark:border-white/8 dark:bg-white/5 dark:text-zinc-300"
                    >
                      <FiPlus size={10} aria-hidden="true" />
                      {step}
                    </motion.button>
                  ))}
                  <button
                    type="button"
                    onClick={() => bumpWeight(-2.5)}
                    className="flex h-7 items-center gap-0.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 text-[11px] font-bold tabular-nums text-zinc-700 transition-colors hover:border-red-400 hover:text-red-600 dark:border-white/8 dark:bg-white/5 dark:text-zinc-300"
                  >
                    <FiMinus size={10} aria-hidden="true" />
                    2.5
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addSet(exercise.id)}
                  className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-emerald-500/10 hover:text-emerald-700 dark:bg-white/8 dark:text-zinc-300"
                >
                  <FiPlus size={12} aria-hidden="true" />
                  Set
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
