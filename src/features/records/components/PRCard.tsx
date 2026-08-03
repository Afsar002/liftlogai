import { motion, useReducedMotion } from "framer-motion";
import { FiZap } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";

interface Props {
  exercise: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  achievedAt?: string;
  rank?: number;
}

const MEDALS: Record<number, { ring: string; badge: string; glyph: string }> = {
  1: { ring: "ring-amber-400/30 bg-amber-400/15 text-amber-500", badge: "bg-gradient-to-br from-amber-300 to-yellow-500", glyph: "🥇" },
  2: { ring: "ring-zinc-300/40 bg-zinc-200/50 text-zinc-500 dark:bg-white/8 dark:text-zinc-300", badge: "bg-gradient-to-br from-zinc-200 to-zinc-400", glyph: "🥈" },
  3: { ring: "ring-orange-400/30 bg-orange-400/15 text-orange-500", badge: "bg-gradient-to-br from-orange-300 to-orange-600", glyph: "🥉" },
};

function medalFor(rank: number) {
  return MEDALS[rank] ?? {
    ring: "ring-zinc-200/50 bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400",
    badge: "bg-zinc-200 dark:bg-white/10",
    glyph: String(rank),
  };
}

function dateLabel(iso?: string): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Record tile — ranked personal-best row with a medal badge, the lift, the
 * estimated 1RM chip and the date it was achieved. Replaces the old flat card.
 */
export default function PRCard({ exercise, weight, reps, estimated1RM, achievedAt, rank }: Props) {
  const reduceMotion = useReducedMotion();
  const medal = medalFor(rank ?? 0);
  const date = dateLabel(achievedAt);

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="flex items-center gap-4 rounded-3xl border border-zinc-200/70 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 dark:border-white/8 dark:bg-[#141417] dark:hover:border-white/15"
    >
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ring-4", medal.ring)}>
        {medal.glyph}
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-black tracking-tight text-zinc-900 dark:text-white">
          {exercise}
        </h2>
        <p className="mt-1 text-xl font-black tabular-nums text-zinc-900 dark:text-white">
          {weight} <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">kg</span>
          <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">×</span>
          {reps} <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">reps</span>
        </p>
        {date && (
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Achieved {date}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          <FiZap size={10} aria-hidden="true" />
          {estimated1RM.toFixed(1)} kg
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
          1RM
        </span>
      </div>
    </motion.article>
  );
}
