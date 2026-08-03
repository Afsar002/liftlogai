import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiClock, FiLayers, FiTrendingUp, FiZap } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import type { ProfileStats } from "../types";

interface Props {
  stats: ProfileStats;
}

function StatTile({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 380, damping: 30 }}
      className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3.5 dark:bg-white/5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm dark:bg-white/8 dark:text-zinc-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-black tabular-nums leading-none text-zinc-950 dark:text-white">
          {value}
        </p>
        <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Journey stats — a 2×2 tile grid of lifetime training numbers, with a streak
 * progress bar. Replaces the old single-card list of the same numbers.
 */
export default function JourneyStats({ stats }: Props) {
  const streakPct = Math.min((stats.streak / 14) * 100, 100);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Lifetime</h3>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          your training footprint
        </span>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-3 p-4">
          <StatTile icon={<FiTrendingUp size={17} aria-hidden="true" />} label="Workouts" value={String(stats.completedWorkouts)} delay={0} />
          <StatTile icon={<FiClock size={17} aria-hidden="true" />} label="Hours" value={`${stats.trainingHours}h`} delay={0.05} />
          <StatTile icon={<FiLayers size={17} aria-hidden="true" />} label="Templates" value={String(stats.templateCount)} delay={0.1} />
          <StatTile icon={<FiActivity size={17} aria-hidden="true" />} label="Exercises" value={String(stats.exerciseCount)} delay={0.15} />
        </div>

        <div className="border-t border-zinc-100 px-5 py-4 dark:border-white/6">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
              <FiZap size={15} className="text-amber-500" aria-hidden="true" />
              Current streak
            </span>
            <span className="text-sm font-black tabular-nums text-zinc-950 dark:text-white">
              {stats.streak} <span className="text-xs font-bold text-zinc-400">days</span>
            </span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
              style={{ width: `${streakPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            {stats.streak >= 14 ? "On fire — 2 weeks straight!" : `${14 - stats.streak} days to a 2-week streak`}
          </p>
        </div>
      </Card>
    </div>
  );
}
