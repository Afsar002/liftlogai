import { motion, useReducedMotion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface RailExercise {
  id: string;
  name: string;
  /** True when every set is completed. */
  done: boolean;
  /** True when the exercise is the one currently being worked. */
  active: boolean;
}

interface Props {
  exercises: RailExercise[];
  onSelect: (id: string) => void;
}

/**
 * Horizontal exercise rail — a compact "chapter list" of the session. Completed
 * exercises show a filled dot, the active exercise glows. Tapping a chip jumps
 * to and expands that exercise, replacing free scrolling through a long stack.
 */
export default function ExerciseProgressRail({ exercises, onSelect }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8">
      <div className="flex min-w-max gap-2 pb-1">
        {exercises.map((exercise, index) => {
          const Icon = exercise.done ? FiCheck : null;
          return (
            <motion.button
              key={exercise.id}
              type="button"
              onClick={() => onSelect(exercise.id)}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              transition={spring}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ transitionDelay: reduceMotion ? "0s" : `${index * 0.03}s` }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                exercise.active
                  ? "border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 to-lime-400/15 text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300"
                  : exercise.done
                    ? "border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/8 dark:bg-white/5 dark:text-zinc-500"
                    : "border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300 dark:border-white/8 dark:bg-[#141417] dark:text-zinc-300"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold tabular-nums",
                  exercise.done
                    ? "bg-emerald-500 text-white"
                    : exercise.active
                      ? "bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950"
                      : "bg-zinc-200/70 text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
                )}
              >
                {Icon ? <FiCheck size={11} aria-hidden="true" /> : index + 1}
              </span>
              <span className="max-w-[10rem] truncate">{exercise.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
