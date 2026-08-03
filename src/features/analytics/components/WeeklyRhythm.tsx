import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiCalendar, FiZap } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";

interface Props {
  data: { day: string; volume: number }[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Weekly rhythm — replaces the paired recharts bar+area charts with one
 * focused card: a big weekly total plus seven day tiles whose height encodes
 * volume. Reads like a biorhythm strip instead of a dashboard chart.
 */
export default function WeeklyRhythm({ data }: Props) {
  const reduceMotion = useReducedMotion();

  const { total, best, tiles } = useMemo(() => {
    const padded = DAY_LABELS.map((label, index) => ({
      label,
      volume: data[index]?.volume ?? 0,
    }));
    const total = padded.reduce((sum, d) => sum + d.volume, 0);
    const best = Math.max(...padded.map((d) => d.volume), 1);
    const today = new Date().getDay();
    const todayIndex = (today + 6) % 7;
    return { total, best, tiles: padded.map((d, i) => ({ ...d, isToday: i === todayIndex })) };
  }, [data]);

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            This Week
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Daily training volume
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FiCalendar size={20} aria-hidden="true" />
        </span>
      </div>

      <div className="px-5 pt-4">
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-black tabular-nums tracking-tight text-zinc-950 dark:text-white">
            {(total / 1000).toFixed(1)}k
          </span>
          <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500">kg this week</span>
        </p>

        {/* Day tiles */}
        <div className="mt-5 flex h-28 items-end gap-1.5">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.label}
              initial={reduceMotion ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: "bottom" }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 26 }}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-[9px] font-bold tabular-nums text-zinc-400 dark:text-zinc-500">
                {tile.volume > 0 ? Math.round(tile.volume / 1000) : ""}
              </span>
              <div
                className={cn(
                  "w-full rounded-t-lg transition-colors",
                  tile.volume === 0
                    ? "h-1.5 rounded bg-zinc-100 dark:bg-white/6"
                    : tile.isToday
                      ? "bg-gradient-to-t from-emerald-600 to-lime-400 shadow-[0_-4px_14px_-4px_rgba(16,185,129,0.6)]"
                      : tile.volume === best
                        ? "bg-emerald-500"
                        : "bg-emerald-500/40"
                )}
                style={{
                  height: tile.volume === 0 ? undefined : `${Math.max(18, (tile.volume / best) * 100)}%`,
                }}
              />
              <span
                className={cn(
                  "text-[9px] font-bold uppercase",
                  tile.isToday ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"
                )}
              >
                {tile.label.slice(0, 1)}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-white/5">
          <FiZap size={14} className="shrink-0 text-emerald-500" aria-hidden="true" />
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {total === 0
              ? "No volume logged yet this week."
              : best === total
                ? "All volume came from one day — try spreading it out."
                : "Your busiest day led the week."}
          </p>
        </div>
      </div>
    </Card>
  );
}
