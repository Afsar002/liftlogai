import { motion, useReducedMotion } from "framer-motion";
import { FiClock, FiActivity, FiTrendingUp, FiX } from "react-icons/fi";
import { useWorkout } from "../context/WorkoutContext";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";
import { useWorkoutStats } from "../hooks/useWorkoutStats";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  onEndWorkout: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export default function WorkoutSessionHeader({
  onEndWorkout,
  onCollapse,
  isCollapsed = false,
}: Props) {
  const { session } = useWorkout();
  const reduceMotion = useReducedMotion();

  const startedAt = session?.startedAt
    ? typeof session.startedAt === "string"
      ? new Date(session.startedAt)
      : session.startedAt
    : new Date();

  const { formatted } = useWorkoutTimer(startedAt);
  const stats = useWorkoutStats(session);

  if (!session) return null;

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn(
        "sticky top-0 z-30 -mx-6 border-b border-zinc-200/70 bg-zinc-50/90 px-6 py-4 backdrop-blur-xl dark:border-white/6 dark:bg-[#0B0B0D]/90 sm:-mx-8 sm:px-8",
        isCollapsed && "py-3"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Workout Info + Stats */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 30 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 dark:bg-emerald-950/20"
          >
            <FiActivity size={20} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </motion.div>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
              Active Session
            </p>
            <h1 className="truncate text-lg font-extrabold tracking-tight text-zinc-950 dark:text-white">
              {session.workoutName}
            </h1>
          </div>

          {/* Live Stats Chips */}
          {!isCollapsed && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 380, damping: 32 }}
              className="flex items-center gap-2 ml-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-white/8 dark:text-zinc-300">
                <FiTrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                {stats.totalVolume.toLocaleString()} kg
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-white/8 dark:text-zinc-300">
                <FiActivity size={12} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                {stats.completedSets}/{stats.totalSets} sets
              </span>
            </motion.div>
          )}
        </div>

        {/* Right: Timer + End Workout */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Live Timer with Pulse */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 380, damping: 32 }}
            className="relative flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-[#141417]"
          >
            <span className="relative flex h-2 w-2">
              <motion.span
                aria-hidden="true"
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                animate={reduceMotion ? false : { scale: [1, 1.7], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <FiClock size={14} className="text-zinc-400" aria-hidden="true" />
            <span className="font-extrabold tabular-nums text-zinc-950 dark:text-white font-mono">
              {formatted}
            </span>
          </motion.div>

          {/* End Workout Button */}
          <motion.button
            onClick={onEndWorkout}
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-fab hover:shadow-fab-hover transition-all"
          >
            <FiCheckCircle size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Finish</span>
          </motion.button>

          {/* Collapse Toggle */}
          {!isCollapsed && onCollapse && (
            <motion.button
              onClick={onCollapse}
              whileHover={reduceMotion ? undefined : { scale: 1.05 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/8 dark:text-zinc-500 dark:hover:text-zinc-300"
              aria-label="Collapse header"
            >
              <FiX size={20} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}

// Need to import FiCheckCircle
import { FiCheckCircle } from "react-icons/fi";