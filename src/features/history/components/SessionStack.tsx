import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiRepeat } from "react-icons/fi";
import type { ExerciseLog } from "../models/WorkoutHistory";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  exercises: ExerciseLog[];
}

/**
 * Expandable session stack. Each exercise is an accordion row — collapsed it
 * shows the number chip, name, set count and volume; expanded it reveals the
 * weight×reps table. This replaced the old one-card-per-exercise stack.
 */
export default function SessionStack({ exercises }: Props) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(exercises[0]?.exerciseName ?? null);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/8 dark:bg-[#141417]">
      {exercises.map((exercise, index) => {
        const volume = exercise.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        const isOpen = openId === exercise.exerciseName;

        return (
          <div
            key={`${exercise.exerciseName}-${index}`}
            className={cn(
              "border-zinc-100 dark:border-white/6",
              index > 0 && "border-t"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : exercise.exerciseName)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold tabular-nums",
                  isOpen
                    ? "bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950"
                    : "bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400"
                )}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-zinc-950 dark:text-white">
                  {exercise.exerciseName}
                </h3>
                <p className="text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                  {exercise.sets.length} sets · {volume.toLocaleString()} kg
                </p>
              </div>

              <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
                <FiRepeat size={10} aria-hidden="true" />
                {exercise.sets.reduce((sum, set) => sum + set.reps, 0)} reps
              </span>

              <motion.span
                animate={reduceMotion ? undefined : { rotate: isOpen ? 180 : 0 }}
                transition={spring}
                className="text-zinc-400 dark:text-zinc-500"
              >
                <FiChevronDown size={16} aria-hidden="true" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 px-4 pb-4 pl-15">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-white/5"
                      >
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                          Set {setIndex + 1}
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 font-bold tabular-nums text-zinc-800 dark:bg-white/8 dark:text-zinc-200">
                            {set.weight} kg
                          </span>
                          <span className="font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                            × {set.reps}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
