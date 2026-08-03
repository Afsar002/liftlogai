import { motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiPlus } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  completion: number;
  onAddExercise: () => void;
  onFinish: () => void;
}

/**
 * Fixed bottom dock for the session: a compact progress ring, an "Add
 * exercise" action and the gradient Finish button. Replaces floating FABs so
 * every primary action lives in one consistent bar above the bottom nav.
 */
export default function SessionDock({ completion, onAddExercise, onFinish }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-6"
      style={{ bottom: "max(6.5rem, calc(env(safe-area-inset-bottom) + 6rem))" }}
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white/90 p-2.5 shadow-[0_12px_40px_-12px_rgba(9,9,11,0.25)] backdrop-blur-xl dark:border-white/8 dark:bg-[#141417]/90">
        {/* Progress ring */}
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <svg className="h-11 w-11 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-zinc-200 dark:stroke-white/10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={264}
              strokeDashoffset={264 * (1 - completion)}
              className="stroke-emerald-500"
              style={{ transition: "stroke-dashoffset 500ms cubic-bezier(0.34,1.56,0.64,1)" }}
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold tabular-nums text-zinc-950 dark:text-white">
            {Math.round(completion * 100)}%
          </span>
        </div>

        <button
          type="button"
          onClick={onAddExercise}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
        >
          <FiPlus size={16} aria-hidden="true" />
          Exercise
        </button>

        <motion.button
          type="button"
          onClick={onFinish}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          transition={spring}
          className={cn(
            "flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-extrabold text-emerald-950 shadow-fab hover:shadow-fab-hover",
            "bg-gradient-to-r from-emerald-500 to-lime-400"
          )}
        >
          <FiCheck size={16} aria-hidden="true" />
          Finish
        </motion.button>
      </div>
    </motion.div>
  );
}
