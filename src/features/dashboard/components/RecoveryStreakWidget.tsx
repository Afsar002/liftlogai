import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiTrendingUp, FiZap, FiMoon, FiSun, FiStar, FiClock } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";
import { spring, listContainer, listItem } from "../../../shared/components/motion/variants";
import { HistoryRepository } from "../../history/repositories/HistoryRepository";
import type { WorkoutHistory } from "../../history/models/WorkoutHistory";

interface RecoveryMetrics {
  streak: number;
  longestStreak: number;
  currentStreakDays: number;
  restDaysThisWeek: number;
  avgRestDays: number;
  recoveryScore: number;
  lastWorkoutDate?: string;
  nextRestDay?: string;
}

function calculateRecoveryMetrics(history: WorkoutHistory[]): RecoveryMetrics {
  if (history.length === 0) {
    return {
      streak: 0,
      longestStreak: 0,
      currentStreakDays: 0,
      restDaysThisWeek: 7,
      avgRestDays: 7,
      recoveryScore: 100,
    };
  }

  // Sort by date descending
  const sorted = [...history].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  // Calculate current streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dayStart = checkDate.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const hasWorkout = sorted.some((w) => {
      const completed = new Date(w.completedAt).getTime();
      return completed >= dayStart && completed < dayEnd;
    });

    if (i === 0 && !hasWorkout) {
      // If no workout today, check yesterday
      continue;
    }

    if (hasWorkout) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Calculate longest streak
  const workoutDates = new Set(
    history.map((w) => new Date(w.completedAt).toDateString())
  );
  const sortedDates = Array.from(workoutDates).sort();
  let longestStreak = 0;
  let current = 0;
  let prevDate: Date | null = null;

  sortedDates.forEach((dateStr) => {
    const date = new Date(dateStr);
    if (prevDate && date.getTime() - prevDate.getTime() === 24 * 60 * 60 * 1000) {
      current++;
    } else {
      current = 1;
    }
    longestStreak = Math.max(longestStreak, current);
    prevDate = date;
  });

  // Rest days this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const workoutsThisWeek = history.filter((w) => new Date(w.completedAt) >= oneWeekAgo).length;
  const restDaysThisWeek = 7 - workoutsThisWeek;

  // Average rest days per week (over last 8 weeks)
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const recentHistory = history.filter((w) => new Date(w.completedAt) >= eightWeeksAgo);
  const weeks = new Map<string, number>();
  recentHistory.forEach((w) => {
    const date = new Date(w.completedAt);
    const weekKey = `${date.getFullYear()}-W${String(Math.ceil(date.getDate() / 7)).padStart(2, '0')}`;
    weeks.set(weekKey, (weeks.get(weekKey) || 0) + 1);
  });
  const avgWorkoutsPerWeek = weeks.size > 0
    ? Array.from(weeks.values()).reduce((a, b) => a + b, 0) / weeks.size
    : 0;
  const avgRestDays = 7 - avgWorkoutsPerWeek;

  // Recovery score (0-100)
  // Based on: rest days this week, streak sustainability, workout frequency
  let recoveryScore = 100;
  if (restDaysThisWeek < 2) recoveryScore -= 30;
  else if (restDaysThisWeek < 3) recoveryScore -= 15;
  if (streak > 10) recoveryScore -= 20; // Overtraining risk
  else if (streak > 7) recoveryScore -= 10;
  if (avgWorkoutsPerWeek > 5) recoveryScore -= 15;
  recoveryScore = Math.max(0, Math.min(100, recoveryScore));

  const lastWorkout = sorted[0];
  const lastWorkoutDate = lastWorkout.completedAt;

  // Next suggested rest day
  let nextRestDay: string | undefined;
  if (restDaysThisWeek === 0) {
    nextRestDay = "Today recommended";
  } else if (restDaysThisWeek === 1) {
    nextRestDay = "Tomorrow recommended";
  }

  return {
    streak,
    longestStreak,
    currentStreakDays: streak,
    restDaysThisWeek,
    avgRestDays: Math.round(avgRestDays * 10) / 10,
    recoveryScore,
    lastWorkoutDate,
    nextRestDay,
  };
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

export default function RecoveryStreakWidget() {
  const reduceMotion = useReducedMotion();
  const [metrics, setMetrics] = useState<RecoveryMetrics | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    const history = await HistoryRepository.getAll();
    setMetrics(calculateRecoveryMetrics(history));
  }

  if (!metrics) {
    return (
      <Card variant="outlined" padding="lg">
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-zinc-400">Loading recovery...</div>
        </div>
      </Card>
    );
  }

  const { streak, longestStreak, restDaysThisWeek, recoveryScore, lastWorkoutDate, nextRestDay, avgRestDays } = metrics;

  // Determine recovery state
  const getRecoveryState = () => {
    if (recoveryScore >= 80) return { label: "Optimal", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/15", icon: FiActivity };
    if (recoveryScore >= 60) return { label: "Good", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/15", icon: FiSun };
    if (recoveryScore >= 40) return { label: "Fair", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/15", icon: FiMoon };
    return { label: "Needs Rest", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/15", icon: FiZap };
  };

  const recoveryState = getRecoveryState();
  const RecoveryIcon = recoveryState.icon;

  return (
    <Card variant="elevated" padding="lg" className="relative overflow-hidden">
      {/* Subtle gradient accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-blue-500" />

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", recoveryState.bg)}>
              <RecoveryIcon size={22} className={recoveryState.color} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
                Recovery & Streak
              </p>
              <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white">
                {recoveryState.label} Recovery
              </h3>
            </div>
          </div>

          {/* Recovery Score Circle */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 30 }}
            className="relative flex h-20 w-20 shrink-0 items-center justify-center"
          >
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-zinc-200/60 dark:text-white/10"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#recoveryGradient)"
                strokeWidth="6"
                strokeDasharray={283}
                strokeDashoffset={reduceMotion ? 283 * (1 - recoveryScore / 100) : 283}
                strokeLinecap="round"
                className={recoveryState.color}
                animate={{ strokeDashoffset: 283 * (1 - recoveryScore / 100) }}
                transition={{ type: "spring", stiffness: 280, damping: 25, duration: 1.5, delay: 0.3 }}
              />
              <defs>
                <linearGradient id="recoveryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea875" />
                  <stop offset="100%" stopColor="#a3e635" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
              {recoveryScore}
            </span>
          </motion.div>
        </div>

        {/* Streak & Rest Days Grid */}
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4"
        >
          {/* Current Streak */}
          <motion.div variants={listItem} className="relative">
            <div className={cn(
              "rounded-2xl p-4 flex flex-col items-center text-center",
              "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <FiStar size={18} className="text-amber-500" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
                  Current Streak
                </span>
              </div>
              <span className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {streak}
              </span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
          </motion.div>

          {/* Longest Streak */}
          <motion.div variants={listItem} style={{ transitionDelay: reduceMotion ? "0s" : "0.04s" }}>
            <div className={cn(
              "rounded-2xl p-4 flex flex-col items-center text-center",
              "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <FiStar size={18} className="text-amber-500" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                  Longest Streak
                </span>
              </div>
              <span className="text-4xl font-extrabold text-amber-700 dark:text-amber-300">
                {longestStreak}
              </span>
              <span className="text-sm text-amber-600 dark:text-amber-400">
                {longestStreak === 1 ? "day" : "days"}
              </span>
            </div>
          </motion.div>

          {/* Rest Days This Week */}
          <motion.div variants={listItem} style={{ transitionDelay: reduceMotion ? "0s" : "0.08s" }}>
            <div className={cn(
              "rounded-2xl p-4 flex flex-col items-center text-center",
              restDaysThisWeek >= 2
                ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20"
                : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <FiMoon size={18} className={restDaysThisWeek >= 2 ? "text-blue-500" : "text-red-500"} aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
                  Rest This Week
                </span>
              </div>
              <span className={cn("text-4xl font-extrabold", restDaysThisWeek >= 2 ? "text-blue-700 dark:text-blue-300" : "text-red-700 dark:text-red-300")}>
                {restDaysThisWeek}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                / 7 days
              </span>
            </div>
          </motion.div>

          {/* Average Rest Days */}
          <motion.div variants={listItem} style={{ transitionDelay: reduceMotion ? "0s" : "0.12s" }}>
            <div className={cn(
              "rounded-2xl p-4 flex flex-col items-center text-center",
              "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20"
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <FiTrendingUp size={18} className="text-purple-500" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
                  Avg Rest/Week
                </span>
              </div>
              <span className="text-4xl font-extrabold text-purple-700 dark:text-purple-300">
                {avgRestDays.toFixed(1)}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                days
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Insights & Recommendations */}
        <div className="pt-4 border-t border-zinc-200/60 dark:border-white/10 space-y-3">
          {lastWorkoutDate && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-white/3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <FiClock size={18} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-950 dark:text-white">Last Workout</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatRelativeTime(lastWorkoutDate)}</p>
              </div>
            </div>
          )}

          {nextRestDay && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <FiZap size={18} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-950 dark:text-white">Recommendation</p>
                <p className="text-xs text-amber-800 dark:text-amber-300">{nextRestDay}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-white/3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <FiTrendingUp size={18} className="text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-950 dark:text-white">Training Balance</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {streak > 7
                  ? "Long streak - consider a deload week"
                  : restDaysThisWeek < 2
                  ? "Low rest days - prioritize recovery"
                  : "Good balance between training and rest"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}