import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiCheck, FiClock } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface SessionStats {
  volume: number;
  completedSets: number;
  totalSets: number;
  totalExercises: number;
}

interface Props {
  workoutName: string;
  formatted: string;
  stats: SessionStats;
  onFinish: () => void;
}

/**
 * Sticky gradient session band. Replaces the plain white sticky header with a
 * dark hero: big tabular timer, live volume/set counters, per-exercise progress
 * dots and a glowing Finish pill. This is the "cockpit" of the session.
 */
export default function SessionHero({
  workoutName,
  formatted,
  stats,
  onFinish,
}: Props) {
  const reduceMotion = useReducedMotion();
  const completion = stats.totalSets > 0 ? stats.completedSets / stats.totalSets : 0;

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="sticky top-0 z-40 -mx-6 border-b border-zinc-200/70 bg-gradient-to-b from-base-50 via-base-50 to-base-50/90 px-6 pb-3 pt-4 backdrop-blur-xl dark:border-white/6 dark:from-[#0B0B0D] dark:via-[#0B0B0D] dark:to-[#0B0B0D]/90 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10"
    >
      <div className="mx-auto max-w-2xl">
        {/* Top row: name + finish */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <motion.span
              initial={reduceMotion ? false : { scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={spring}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950"
            >
              <FiActivity size={16} aria-hidden="true" />
            </motion.span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Active session
              </p>
              <h1 className="truncate text-base font-extrabold tracking-tight text-zinc-950 dark:text-white">
                {workoutName}
              </h1>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={onFinish}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            transition={spring}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2 text-xs font-extrabold text-emerald-950 shadow-fab hover:shadow-fab-hover"
          >
            <FiCheck size={15} aria-hidden="true" />
            Finish
          </motion.button>
        </div>

        {/* Timer + live counters */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
              <FiClock size={14} aria-hidden="true" />
            </span>
            <span className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-zinc-950 dark:text-white">
              {formatted}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold tabular-nums text-zinc-600 dark:bg-white/8 dark:text-zinc-300">
              {stats.volume.toLocaleString()} kg
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums",
                stats.completedSets === stats.totalSets && stats.totalSets > 0
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-white/8 dark:text-zinc-300"
              )}
            >
              {stats.completedSets}/{stats.totalSets} sets
            </span>
          </div>
        </div>

        {/* Progress track */}
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${Math.round(completion * 100)}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          />
        </div>
      </div>
    </motion.header>
  );
}
