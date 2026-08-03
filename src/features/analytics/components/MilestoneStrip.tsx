import { motion, useReducedMotion } from "framer-motion";
import { FiAward, FiClock, FiStar, FiZap } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";

interface Props {
  workouts: number;
  volume: number;
  minutes: number;
  prs: number;
}

/**
 * Milestone strip — a row of "next goal" cards. Each shows a progress ring so
 * users always have a concrete target below the hero numbers.
 */
export default function MilestoneStrip({ workouts, volume, minutes, prs }: Props) {
  const reduceMotion = useReducedMotion();

  const milestones = [
    { id: "m1", icon: <FiZap size={15} />, label: "Workouts", target: 50, current: workouts, unit: "" },
    { id: "m2", icon: <FiStar size={15} />, label: "Volume", target: 100000, current: volume, unit: "kg" },
    { id: "m3", icon: <FiClock size={15} />, label: "Training", target: 600, current: minutes, unit: "min" },
    { id: "m4", icon: <FiAward size={15} />, label: "PRs", target: 20, current: prs, unit: "" },
  ];

  return (
    <Card>
      <div className="px-5 pt-5">
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Milestones</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Next goals on the board</p>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 py-5 sm:grid-cols-4">
        {milestones.map((m, index) => {
          const pct = Math.min(m.current / m.target, 1);
          const earned = pct >= 1;
          return (
            <motion.div
              key={m.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 30 }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center",
                earned
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-zinc-200/70 dark:border-white/8"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl",
                  earned
                    ? "bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950"
                    : "bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400"
                )}
              >
                {m.icon}
              </span>
              <p className="text-lg font-black tabular-nums leading-none text-zinc-950 dark:text-white">
                {Math.round(pct * 100)}
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">%</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {m.label}
              </p>
              <p className="text-[9px] font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                {m.current.toLocaleString()}/{m.target.toLocaleString()}{m.unit}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
