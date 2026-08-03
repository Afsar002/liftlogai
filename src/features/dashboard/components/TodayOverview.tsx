import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiCheck, FiClock, FiZap } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { cn } from "../../../shared/lib/cn";
import { spring, listContainer, listItem } from "../../../shared/components/motion/variants";

interface WorkoutSession {
  id: string;
  workoutName: string;
  startedAt: string | Date;
  exercises: { name: string; sets: { weight: number; reps: number }[] }[];
}

interface TodayOverviewProps {
  lastWorkout?: string;
  lastWorkoutDate?: string;
  workoutsThisWeek: number;
  streak: number;
  totalVolume: number;
  averageDuration: number;
}

function getWeekProgress(completed: number, goal = 4) {
  return Math.min(completed / goal, 1);
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
}

function getNextWorkoutDay(streak: number) {
  if (streak === 0) return "Start your streak today";
  if (streak < 7) return `${7 - streak} days to weekly goal`;
  return "Weekly goal achieved!";
}

const STORAGE_KEY = "liftlog_active_workout_session";

function loadPersistedSession(): WorkoutSession | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.id &&
      parsed.workoutName &&
      Array.isArray(parsed.exercises)
    ) {
      return {
        ...parsed,
        startedAt: parsed.startedAt ? new Date(parsed.startedAt) : new Date(),
      };
    }
  } catch (e) {
    // Graceful fallback on storage access error or JSON corruption
  }
  return null;
}

export default function TodayOverview({
  lastWorkout,
  lastWorkoutDate,
  workoutsThisWeek,
  streak,
  totalVolume,
  averageDuration,
}: TodayOverviewProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    function checkActiveSession() {
      const session = loadPersistedSession();
      if (session) {
        setActiveSession(session);
      }
    }
    checkActiveSession();

    // Listen for storage changes from other tabs
    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        const session = loadPersistedSession();
        setActiveSession(session);
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const weekProgress = getWeekProgress(workoutsThisWeek);
  const hasActiveSession = !!activeSession;
  const isTodayWorkout = lastWorkoutDate && new Date(lastWorkoutDate).toDateString() === new Date().toDateString();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
      className="space-y-4"
    >
      {/* Main Today Card - Full Width Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
        <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left: Today Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 flex-1">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950 shadow-fab">
              <FiActivity size={28} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
                Today
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white truncate">
                {isTodayWorkout ? "Workout Complete" : hasActiveSession ? "Workout in Progress" : "Ready to Train"}
              </h2>
              <p className="mt-1 text-xs font-semibold text-white/60">
                {isTodayWorkout
                  ? `Completed ${lastWorkout} · ${formatRelativeTime(lastWorkoutDate!)}`
                  : hasActiveSession
                  ? `Continue ${activeSession.workoutName}`
                  : "No workout logged yet today"}
              </p>
            </div>
          </div>

          {/* Right: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {hasActiveSession && (
              <Button
                variant="gradient"
                size="lg"
                icon={<FiActivity size={20} />}
                onClick={() => navigate("/workout")}
                className="shadow-fab hover:shadow-fab-hover"
              >
                Continue Workout
              </Button>
            )}
            {!hasActiveSession && !isTodayWorkout && (
              <Button
                variant="gradient"
                size="lg"
                icon={<FiZap size={20} />}
                onClick={() => navigate("/workout")}
                className="shadow-fab hover:shadow-fab-hover"
              >
                Start Workout
              </Button>
            )}
            {isTodayWorkout && (
              <Button
                variant="outline"
                size="lg"
                icon={<FiCheck size={20} />}
                onClick={() => navigate("/history")}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
              >
                View Summary
              </Button>
            )}
          </div>
        </div>

        {/* Weekly Progress Bar - Bottom */}
        <div className="relative mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Weekly Progress</span>
            <span className="text-sm font-black tabular-nums text-emerald-300">
              {workoutsThisWeek} / 4 sessions
            </span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${weekProgress * 100}%` }}
              transition={{ type: "spring", stiffness: 280, damping: 25, duration: 1.2, delay: 0.3 }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-white/50">
            {getNextWorkoutDay(workoutsThisWeek)}
          </p>
        </div>
      </section>

      {/* Stats Grid - Varied Heights */}
      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4"
      >
        {/* Streak Card - Tall */}
        <motion.div variants={listItem} className="relative">
          <Card variant="default" padding="lg" className="h-full min-h-[140px] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <FiZap size={18} aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
                Streak
              </span>
            </div>
            <div className="flex flex-col flex-1 justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tabular-nums text-zinc-950 dark:text-white sm:text-4xl">
                  {streak}
                </span>
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 self-end">
                  days
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <FiActivity size={14} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>{streak > 0 ? "On fire! Keep it going" : "Start your streak today"}</span>
              </div>
            </div>
            {/* Streak visual indicator */}
            <div className="absolute bottom-4 right-4 opacity-20">
              <FiZap size={48} className="text-amber-500" aria-hidden="true" />
            </div>
          </Card>
        </motion.div>

        {/* Volume Card - Tall */}
        <motion.div variants={listItem} style={{ transitionDelay: reduceMotion ? "0s" : "0.04s" }}>
          <Card variant="default" padding="lg" className="h-full min-h-[140px] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <FiZap size={18} aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
                Total Volume
              </span>
            </div>
            <div className="flex flex-col flex-1 justify-between">
              <span className="text-3xl font-extrabold tabular-nums text-zinc-950 dark:text-white sm:text-4xl">
                {totalVolume.toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <FiClock size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>{averageDuration} min avg session</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 opacity-20">
              <FiActivity size={48} className="text-blue-500" aria-hidden="true" />
            </div>
          </Card>
        </motion.div>

        {/* This Week Card - Standard Height */}
        <motion.div variants={listItem} style={{ transitionDelay: reduceMotion ? "0s" : "0.08s" }}>
          <Card variant="default" padding="md" className="h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <FiActivity size={16} aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
                This Week
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
                {workoutsThisWeek}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">/ 4 goal</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/12">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-400"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${weekProgress * 100}%` }}
                transition={{ type: "spring", stiffness: 280, damping: 25, duration: 1, delay: 0.4 }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Average Duration - Standard Height */}
        <motion.div variants={listItem} style={{ transitionDelay: reduceMotion ? "0s" : "0.12s" }}>
          <Card variant="default" padding="md" className="h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <FiClock size={16} aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
                Avg Duration
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tabular-nums text-zinc-950 dark:text-white">
                {averageDuration}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">minutes</span>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {averageDuration > 60 ? "Long sessions" : averageDuration > 30 ? "Solid sessions" : "Quick sessions"}
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}