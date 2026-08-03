import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiAward, FiClock, FiDroplet, FiHeart, FiStar, FiTrendingUp } from "react-icons/fi";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import { cn } from "../../../shared/lib/cn";

interface Props {
  history: WorkoutHistory[];
}

interface Achievement {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  unlocked: boolean;
  progress: number;
}

function buildAchievements(history: WorkoutHistory[]): Achievement[] {
  const total = history.length;
  const volume = history.reduce((sum, w) => sum + w.totalVolume, 0);
  const minutes = history.reduce((sum, w) => sum + w.durationMinutes, 0);
  const maxExercises = history.reduce((m, w) => Math.max(m, w.exercises.length), 0);

  return [
    {
      id: "first",
      icon: <FiStar size={16} />,
      title: "First Rep",
      desc: "Log your first workout",
      unlocked: total >= 1,
      progress: Math.min(total / 1, 1),
    },
    {
      id: "ten",
      icon: <FiAward size={16} />,
      title: "Double Digits",
      desc: "Complete 10 workouts",
      unlocked: total >= 10,
      progress: Math.min(total / 10, 1),
    },
    {
      id: "volume",
      icon: <FiDroplet size={16} />,
      title: "Volume Tank",
      desc: "Lift 100,000 kg total",
      unlocked: volume >= 100000,
      progress: Math.min(volume / 100000, 1),
    },
    {
      id: "hours",
      icon: <FiClock size={16} />,
      title: "Iron Hours",
      desc: "Train 5 hours total",
      unlocked: minutes >= 300,
      progress: Math.min(minutes / 300, 1),
    },
    {
      id: "session",
      icon: <FiTrendingUp size={16} />,
      title: "Session Stacker",
      desc: "6+ exercises in one session",
      unlocked: maxExercises >= 6,
      progress: Math.min(maxExercises / 6, 1),
    },
    {
      id: "streak",
      icon: <FiHeart size={16} />,
      title: "Commitment",
      desc: "3 workouts in one week",
      unlocked: history.some((_, i) => {
        if (i + 2 >= history.length) return false;
        const a = new Date(history[i].completedAt).getTime();
        const b = new Date(history[i + 2].completedAt).getTime();
        return b - a <= 7 * 24 * 60 * 60 * 1000;
      }),
      progress: 0.8,
    },
  ];
}

/**
 * Horizontal scroll of milestone badges with unlock rings. Turned-off
 * achievements show as ghost chips with a progress bar so users always have a
 * next goal in sight.
 */
export default function AchievementStrip({ history }: Props) {
  const reduceMotion = useReducedMotion();
  const achievements = useMemo(() => buildAchievements(history), [history]);
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Achievements</h3>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          {unlocked}/{achievements.length} earned
        </span>
      </div>

      <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8">
        <div className="flex min-w-max gap-2.5 pb-1">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 30 }}
              className={cn(
                "flex w-32 shrink-0 flex-col gap-2 rounded-2xl border p-3",
                achievement.unlocked
                  ? "border-amber-500/30 bg-gradient-to-b from-amber-500/15 to-transparent"
                  : "border-zinc-200/70 bg-white dark:border-white/8 dark:bg-[#141417]"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl",
                    achievement.unlocked
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950"
                      : "bg-zinc-100 text-zinc-400 dark:bg-white/8 dark:text-zinc-500"
                  )}
                >
                  {achievement.icon}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-extrabold",
                    achievement.unlocked
                      ? "text-amber-600 dark:text-amber-300"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {achievement.unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold leading-tight text-zinc-900 dark:text-white">
                  {achievement.title}
                </p>
                <p className="mt-0.5 text-[10px] font-medium leading-snug text-zinc-500 dark:text-zinc-400">
                  {achievement.desc}
                </p>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    achievement.unlocked
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-zinc-300 dark:bg-white/20"
                  )}
                  style={{ width: `${Math.round(achievement.progress * 100)}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
