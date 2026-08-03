import { motion } from "framer-motion";
import {
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSkipForward,
} from "react-icons/fi";
import { dialogPanel } from "../../../shared/components/motion/variants";

interface RestTimerProps {
  formatted: string;
  running: boolean;
  secondsLeft: number;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export default function RestTimer({
  formatted,
  running,
  secondsLeft,
  onPause,
  onResume,
  onReset,
  onSkip,
}: RestTimerProps) {
  if (!running && secondsLeft === 90) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={dialogPanel}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+7rem)] left-1/2 z-40 w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-card-hover dark:border-white/10 dark:bg-[#141417]"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
          Rest Timer
        </p>
        {running && (
          <span className="relative flex h-2 w-2">
            <motion.span
              aria-hidden="true"
              className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        )}
      </div>

      <motion.p
        key={formatted}
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="mt-3 text-center text-5xl font-extrabold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400"
      >
        {formatted}
      </motion.p>

      <div className="mt-5 flex justify-center gap-3">
        {running ? (
          <button
            type="button"
            onClick={onPause}
            aria-label="Pause rest timer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
          >
            <FiPause />
          </button>
        ) : (
          <button
            type="button"
            onClick={onResume}
            aria-label="Resume rest timer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
          >
            <FiPlay />
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          aria-label="Reset rest timer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
        >
          <FiRotateCcw />
        </button>

        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip rest timer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
        >
          <FiSkipForward />
        </button>
      </div>
    </motion.div>
  );
}
