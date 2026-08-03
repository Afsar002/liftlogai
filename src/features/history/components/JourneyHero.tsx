import { motion, useReducedMotion } from "framer-motion";
import { FiAward, FiClock, FiTrendingUp, FiZap } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  totalWorkouts: number;
  totalMinutes: number;
  totalVolume: number;
  streak: number;
  longestStreak: number;
}

function Stat({
  icon,
  label,
  value,
  unit,
  accent = false,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className={cn(
        "flex flex-col gap-1 rounded-2xl border px-3 py-2.5",
        accent
          ? "border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-400/10"
          : "border-white/12 bg-white/8"
      )}
    >
      <span className={cn("flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider", accent ? "text-amber-300" : "text-white/60")}>
        {icon}
        {label}
      </span>
      <span className={cn("text-xl font-extrabold tabular-nums leading-none", accent ? "text-amber-200" : "text-white")}>
        {value}
        {unit && <span className="ml-1 text-xs font-bold text-white/50">{unit}</span>}
      </span>
    </motion.div>
  );
}

/**
 * Gradient journey hero. Replaces the plain summary card with a rich band:
 * user-facing "lifetime" totals, a live week ring and the current streak flame.
 */
export default function JourneyHero({
  totalWorkouts,
  totalMinutes,
  totalVolume,
  streak,
  longestStreak,
}: Props) {
  const reduceMotion = useReducedMotion();
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950 p-6 text-white shadow-[0_16px_50px_-16px_rgba(6,146,108,0.45)] dark:border-white/10"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-lime-400/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
              Your Journey
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">
              {totalWorkouts} workouts logged
            </h2>
            <p className="mt-1 text-sm font-medium text-white/60">
              {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} under the bar ·{" "}
              {totalVolume.toLocaleString()} kg lifted
            </p>
          </div>

          {/* Streak flame */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ ...spring, delay: 0.15 }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/40 bg-gradient-to-br from-amber-500/30 to-orange-500/10 shadow-[0_0_30px_-6px_rgba(245,158,11,0.6)]"
            >
              <div className="flex flex-col items-center leading-none">
                <FiZap size={18} className="text-amber-300" aria-hidden="true" />
                <span className="mt-0.5 text-lg font-black tabular-nums text-amber-200">
                  {streak}
                </span>
              </div>
            </motion.div>
            <span className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-300/80">
              day streak
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat icon={<FiTrendingUp size={12} aria-hidden="true" />} label="Total" value={totalWorkouts.toLocaleString()} unit="workouts" delay={0.2} />
          <Stat icon={<FiClock size={12} aria-hidden="true" />} label="Time" value={String(hours)} unit="hours" delay={0.26} />
          <Stat icon={<FiAward size={12} aria-hidden="true" />} label="Best streak" value={String(longestStreak)} unit="days" accent delay={0.32} />
        </div>
      </div>
    </motion.div>
  );
}
