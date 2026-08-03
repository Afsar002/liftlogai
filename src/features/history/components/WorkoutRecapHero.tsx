import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiCheckCircle, FiClock, FiLayers, FiTarget, FiZap } from "react-icons/fi";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  name: string;
  dateLabel: string;
  stats: { exercises: number; duration: number; sets: number; volume: number };
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
      className="flex flex-col items-center gap-1 rounded-2xl border border-white/12 bg-white/8 px-2 py-3"
    >
      <span className="text-white/60">{icon}</span>
      <span className="text-lg font-extrabold tabular-nums leading-none text-white">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">{label}</span>
    </motion.div>
  );
}

/**
 * Gradient recap hero for a completed workout — the "certificate" header that
 * replaced the plain card. Shows the session name, full date and a 4-up stat
 * band with a checkmark seal.
 */
export default function WorkoutRecapHero({ name, dateLabel, stats }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950 p-6 text-white shadow-[0_16px_50px_-16px_rgba(6,146,108,0.45)] dark:border-white/10"
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-lime-400/15 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950">
              <FiActivity size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
                Session complete
              </p>
              <h1 className="line-clamp-2 text-2xl font-black tracking-tight">{name}</h1>
              <p className="mt-0.5 text-sm font-medium text-white/60">{dateLabel}</p>
            </div>
          </div>

          <motion.span
            initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring, delay: 0.2 }}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-extrabold text-emerald-200"
          >
            <FiCheckCircle size={14} aria-hidden="true" />
            Done
          </motion.span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <HeroStat icon={<FiTarget size={15} aria-hidden="true" />} label="Ex." value={String(stats.exercises)} delay={0.15} />
          <HeroStat icon={<FiClock size={15} aria-hidden="true" />} label="Time" value={`${stats.duration}m`} delay={0.2} />
          <HeroStat icon={<FiLayers size={15} aria-hidden="true" />} label="Sets" value={String(stats.sets)} delay={0.25} />
          <HeroStat icon={<FiZap size={15} aria-hidden="true" />} label="kg" value={stats.volume.toLocaleString()} delay={0.3} />
        </div>
      </div>
    </motion.div>
  );
}
