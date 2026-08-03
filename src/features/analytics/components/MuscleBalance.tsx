import { motion, useReducedMotion } from "framer-motion";
import { FiActivity } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";

interface Props {
  data: { name: string; value: number }[];
}

/**
 * Muscle balance — ranked horizontal bars (replaces the donut). Each group
 * shows its share of total volume as a segmented bar with a fixed emerald ramp,
 * so distribution reads left-to-right instead of around a circle.
 */
export default function MuscleBalance({ data }: Props) {
  const reduceMotion = useReducedMotion();
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const bars = data.map((d) => ({ ...d, share: (d.value / total) * 100 }));
  const maxShare = Math.max(...bars.map((b) => b.share), 1);

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Muscle Balance
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Training volume by muscle group
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FiActivity size={20} aria-hidden="true" />
        </span>
      </div>

      <div className="space-y-4 px-5 py-5">
        {bars.map((bar, index) => (
          <div key={bar.name}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {bar.name}
              </span>
              <span className="font-bold tabular-nums text-zinc-500 dark:text-zinc-400">
                {Math.round(bar.share)}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/6">
              <motion.div
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${(bar.share / maxShare) * 100}%` }}
                transition={{ delay: index * 0.06, type: "spring", stiffness: 220, damping: 28 }}
                className={cn(
                  "h-full rounded-full",
                  index === 0
                    ? "bg-gradient-to-r from-emerald-500 to-lime-400"
                    : "bg-emerald-500/40"
                )}
              />
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No training volume yet.
          </p>
        )}
      </div>
    </Card>
  );
}
