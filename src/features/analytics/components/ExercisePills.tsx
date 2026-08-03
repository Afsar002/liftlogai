import { motion, useReducedMotion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  exercises: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Horizontal exercise pills — replaces the native <select> dropdown for the
 * strength chart. Scrollable chip rail with an animated active pill.
 */
export default function ExercisePills({ exercises, selectedId, onSelect }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-3 shadow-sm dark:border-white/8 dark:bg-[#141417]">
      <div className="mb-2.5 flex items-center gap-2 px-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FiTrendingUp size={14} aria-hidden="true" />
        </span>
        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Track strength by exercise</p>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max gap-1.5 pb-1">
          {exercises.map((exercise) => {
            const active = exercise.id === selectedId;
            return (
              <motion.button
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise.id)}
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                transition={spring}
                className={cn(
                  "relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "text-emerald-950"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="strength-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                  />
                )}
                <span className="relative">{exercise.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
