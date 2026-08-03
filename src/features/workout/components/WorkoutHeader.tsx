import { FiClock } from "react-icons/fi";
import { motion } from "framer-motion";

interface Props {
  title: string;
  duration: string;
}

/**
 * Sticky active-session bar: workout name + live timer with a pulsing
 * emerald live-dot. The pulse is Motion-driven (reduced-motion aware).
 */
export default function WorkoutHeader({
  title,
  duration,
}: Props) {
  return (
    <header className="sticky top-0 z-30 -mx-6 border-b border-zinc-200/70 bg-zinc-50/90 px-6 py-3 backdrop-blur-xl dark:border-white/6 dark:bg-[#0B0B0D]/90 sm:-mx-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
            Active Session
          </p>
          <h1 className="truncate text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 shadow-sm dark:border-white/10 dark:bg-[#141417]">
          <span className="relative flex h-2 w-2">
            <motion.span
              aria-hidden="true"
              className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <FiClock size={14} className="text-zinc-400" aria-hidden="true" />
          <span className="font-semibold tabular-nums text-zinc-900 dark:text-white">
            {duration}
          </span>
        </div>
      </div>
    </header>
  );
}
