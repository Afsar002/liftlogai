import { motion, useReducedMotion } from "framer-motion";
import { FiAward, FiTrendingUp, FiActivity } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";

interface Props {
  previousBest?: string;
  isPR?: boolean;
  prType?: "weight" | "reps" | "volume";
}

export default function PerformanceReference({
  previousBest,
  isPR = false,
  prType = "weight",
}: Props) {
  const reduceMotion = useReducedMotion();

  if (!previousBest || previousBest === "-") {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 dark:bg-white/5"
      >
        <FiActivity size={14} className="text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No previous data</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 transition-all",
        isPR
          ? "bg-amber-500/15 border border-amber-500/30 dark:border-amber-500/20"
          : "bg-zinc-100 dark:bg-white/5"
      )}
    >
      {!isPR ? (
        <>
          <FiActivity size={14} className="text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Previous
          </span>
        </>
      ) : (
        <>
          <motion.span
            className="flex items-center gap-1"
            animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiAward size={14} className="text-amber-500" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              PR!
            </span>
          </motion.span>
        </>
      )}
      <motion.span
        className="text-base font-extrabold tabular-nums text-zinc-950 dark:text-white"
        initial={reduceMotion ? false : { opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 380, damping: 32 }}
      >
        {previousBest}
      </motion.span>

      {isPR && prType && (
        <motion.span
          className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 380, damping: 32 }}
        >
          <FiTrendingUp size={10} aria-hidden="true" />
          {prType.charAt(0).toUpperCase() + prType.slice(1)}
        </motion.span>
      )}
    </motion.div>
  );
}