import { motion, useReducedMotion } from "framer-motion";
import { FiAward, FiStar, FiTrendingUp, FiZap } from "react-icons/fi";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  workouts: number;
  volume: number;
  streak: number;
  prs: number;
  favorite: string;
  /** 0-1 activity score for the current week. */
  weeklyScore: number;
}

function HeroStat({
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
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className="flex flex-col gap-1 rounded-2xl border border-white/12 bg-white/8 px-3 py-2.5"
    >
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
        {icon}
        {label}
      </span>
      <span className="truncate text-xl font-extrabold tabular-nums leading-none text-white">
        {value}
      </span>
    </motion.div>
  );
}

/**
 * Analytics hero — replaces the 8-up metric grid with one gradient band:
 * headline numbers plus a weekly consistency ring. Everything else on the page
 * is now "insights below the fold".
 */
export default function InsightHero({
  workouts,
  volume,
  streak,
  prs,
  favorite,
  weeklyScore,
}: Props) {
  const reduceMotion = useReducedMotion();
  const score = Math.round(weeklyScore * 100);
  const ring = 2 * Math.PI * 34;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950 p-6 text-white shadow-[0_16px_50px_-16px_rgba(6,146,108,0.45)] dark:border-white/10"
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-lime-400/20 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
            Performance Overview
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Your analytics</h2>
          <p className="mt-1 line-clamp-1 text-sm font-medium text-white/60">
            Favorite: <span className="font-bold text-emerald-300">{favorite}</span>
          </p>
        </div>

        {/* Weekly score ring */}
        <div className="flex shrink-0 flex-col items-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" className="stroke-white/12" />
              <motion.circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={ring}
                initial={reduceMotion ? false : { strokeDashoffset: ring }}
                animate={{ strokeDashoffset: ring * (1 - weeklyScore) }}
                transition={{ ...spring, delay: 0.2 }}
                className="stroke-emerald-400"
              />
            </svg>
            <div className="absolute text-center leading-none">
              <span className="block text-xl font-black tabular-nums text-white">{score}</span>
              <span className="block text-[8px] font-bold uppercase tracking-widest text-white/50">
                score
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <HeroStat icon={<FiTrendingUp size={12} aria-hidden="true" />} label="Workouts" value={String(workouts)} delay={0.1} />
        <HeroStat icon={<FiStar size={12} aria-hidden="true" />} label="Volume" value={`${(volume / 1000).toFixed(1)}k kg`} delay={0.16} />
        <HeroStat icon={<FiZap size={12} aria-hidden="true" />} label="Streak" value={`${streak} d`} delay={0.22} />
        <HeroStat icon={<FiAward size={12} aria-hidden="true" />} label="PRs" value={String(prs)} delay={0.28} />
      </div>
    </motion.div>
  );
}
