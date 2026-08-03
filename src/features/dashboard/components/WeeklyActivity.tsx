import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiTrendingUp, FiClock, FiTarget } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";
import { spring, listContainer, listItem } from "../../../shared/components/motion/variants";
import { HistoryRepository } from "../../history/repositories/HistoryRepository";
import type { WorkoutHistory } from "../../history/models/WorkoutHistory";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayFullNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface WeeklyActivityData {
  day: string;
  dayFull: string;
  volume: number;
  workouts: number;
  duration: number;
  isToday: boolean;
  hasWorkout: boolean;
}

interface WeeklyActivityProps {
  limit?: number;
}

export default function WeeklyActivity({ limit = 7 }: WeeklyActivityProps) {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<WeeklyActivityData[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{ volume: number; workouts: number; duration: number }>({
    volume: 0,
    workouts: 0,
    duration: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const history = await HistoryRepository.getAll();

    const today = new Date().getDay(); // 0 = Sunday
    const weekData: WeeklyActivityData[] = [];

    let totalVolume = 0;
    let totalWorkouts = 0;
    let totalDuration = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayWorkouts = history.filter((w) => {
        const completed = new Date(w.completedAt).getTime();
        return completed >= dayStart && completed < dayEnd;
      });

      const volume = dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
      const duration = dayWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);

      if (i < 7) {
        totalVolume += volume;
        totalWorkouts += dayWorkouts.length;
        totalDuration += duration;
      }

      weekData.push({
        day: dayNames[(date.getDay() + 6) % 7],
        dayFull: dayFullNames[(date.getDay() + 6) % 7],
        volume,
        workouts: dayWorkouts.length,
        duration,
        isToday: i === 0,
        hasWorkout: dayWorkouts.length > 0,
      });
    }

    setData(weekData);
    setWeeklyTrend({
      volume: totalVolume,
      workouts: totalWorkouts,
      duration: Math.round(totalDuration / Math.max(1, totalWorkouts)),
    });
  }

  const maxVolume = Math.max(...data.map((d) => d.volume), 1);

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
            Weekly Activity
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-zinc-950 dark:text-white">
            Last 7 Days
          </h3>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-right">
          <div>
            <p className="text-2xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
              {weeklyTrend.volume.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Volume (kg)</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
              {weeklyTrend.workouts}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sessions</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold tabular-nums text-blue-700 dark:text-blue-300">
              {weeklyTrend.duration}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Avg Min</p>
          </div>
        </div>
      </div>

      {/* Day Bars - Visual and prominent */}
      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {data.map((day, index) => (
          <motion.div
            key={day.day}
            variants={listItem}
            style={{ transitionDelay: reduceMotion ? "0s" : `${index * 0.06}s` }}
            className={cn(
              "group relative flex items-center gap-4 rounded-xl p-3 transition-all duration-200",
              "bg-zinc-50/50 hover:bg-zinc-100/80 dark:bg-white/3 dark:hover:bg-white/6",
              day.isToday && "ring-2 ring-emerald-500/30 dark:ring-emerald-500/20"
            )}
          >
            {/* Day Label */}
            <div className={cn("flex flex-col items-start shrink-0 w-20", day.isToday && "text-emerald-700 dark:text-emerald-300")}>
              <span className={cn("text-xs font-bold uppercase tracking-wider", day.isToday ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-600 dark:text-zinc-300")}>
                {day.day}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{day.isToday ? "Today" : day.dayFull.slice(0, 3)}</span>
            </div>

            {/* Volume Bar - Main Visual */}
            <div className="flex-1 h-10 relative rounded-full overflow-hidden bg-zinc-200/60 dark:bg-white/8">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 to-lime-400"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: day.hasWorkout ? `${Math.max((day.volume / maxVolume) * 100, 8)}%` : "0%" }}
                transition={{ type: "spring", stiffness: 300, damping: 28, duration: 1, delay: reduceMotion ? 0 : 0.2 }}
              />
              {day.hasWorkout && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-white text-xs font-bold">
                  <FiTrendingUp size={12} aria-hidden="true" />
                  <span>{day.volume > 999 ? `${(day.volume / 1000).toFixed(1)}k` : day.volume}</span>
                </div>
              )}
            </div>

            {/* Workout Count Badge */}
            <div className={cn(
              "shrink-0 flex h-8 min-w-[8px] items-center justify-center rounded-full px-2.5 text-xs font-bold transition-all",
              day.hasWorkout
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-500/25"
                : "bg-zinc-200/60 text-zinc-400 dark:bg-white/8 dark:text-zinc-500"
            )}>
              {day.workouts > 0 ? day.workouts : "—"}
            </div>

            {/* Today Indicator */}
            {day.isToday && (
              <motion.div
                className="ml-2 flex h-6 w-6 items-center justify-center"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="h-2 w-2 rounded-full bg-emerald-600" />
              </motion.div>
            )}

            {/* Workout preview on hover */}
            <div className="absolute left-20 right-16 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <FiClock size={12} aria-hidden="true" />
                <span>{day.duration} min</span>
                <FiTarget size={12} className="ml-2" aria-hidden="true" />
                <span>{day.workouts} session{day.workouts !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile Summary */}
      <div className="sm:hidden mt-6 pt-6 border-t border-zinc-200/60 dark:border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
              {weeklyTrend.volume.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Volume</p>
          </div>
          <div>
            <p className="text-xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
              {weeklyTrend.workouts}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sessions</p>
          </div>
          <div>
            <p className="text-xl font-extrabold tabular-nums text-blue-700 dark:text-blue-300">
              {weeklyTrend.duration}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Avg Min</p>
          </div>
        </div>
      </div>
    </Card>
  );
}