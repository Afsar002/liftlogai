import { motion, useReducedMotion } from "framer-motion";
import { FiAward, FiRepeat } from "react-icons/fi";

interface Props {
  weight: number;
  reps: number;
}

/**
 * Personal record highlight — a gradient-tinted banner with the best-ever
 * lift and rep count. Replaces the old flat grey card.
 */
export default function PRCard({ weight, reps }: Props) {
  const reduceMotion = useReducedMotion();

  if (!weight && !reps) return null;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent p-5 dark:border-emerald-400/20"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950 shadow-fab">
          <FiAward size={22} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Personal record
          </p>
          <p className="mt-0.5 text-3xl font-black tabular-nums tracking-tight text-zinc-900 dark:text-white">
            {weight} <span className="text-base font-bold text-zinc-400 dark:text-zinc-500">kg</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-white/70 px-3 py-2 text-sm font-extrabold tabular-nums text-zinc-800 shadow-sm dark:bg-white/8 dark:text-zinc-200">
          <FiRepeat size={14} className="text-emerald-500" aria-hidden="true" />
          × {reps} reps
        </div>
      </div>
    </motion.section>
  );
}
