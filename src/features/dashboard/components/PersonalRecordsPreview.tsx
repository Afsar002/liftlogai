import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiAward, FiArrowRight, FiTrendingUp, FiChevronRight } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";
import { spring, listContainer, listItem } from "../../../shared/components/motion/variants";
import { HistoryRepository } from "../../history/repositories/HistoryRepository";
import type { WorkoutHistory, ExerciseLog } from "../../history/models/WorkoutHistory";

interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  date: string;
  isNew?: boolean;
}

interface PRPreviewProps {
  limit?: number;
}

function calculatePRs(history: WorkoutHistory[]): PersonalRecord[] {
  const prMap = new Map<string, PersonalRecord>();

  history.forEach((workout) => {
    workout.exercises.forEach((exercise: ExerciseLog) => {
      exercise.sets.forEach((set) => {
        const volume = set.weight * set.reps;
        const key = exercise.exerciseName;

        if (!prMap.has(key)) {
          prMap.set(key, {
            exerciseName: exercise.exerciseName,
            maxWeight: set.weight,
            maxReps: set.reps,
            maxVolume: volume,
            date: workout.completedAt,
            isNew: false,
          });
        } else {
          const pr = prMap.get(key)!;
          let updated = false;

          if (set.weight > pr.maxWeight) {
            pr.maxWeight = set.weight;
            pr.maxReps = set.reps;
            pr.maxVolume = volume;
            pr.date = workout.completedAt;
            updated = true;
          } else if (set.weight === pr.maxWeight && set.reps > pr.maxReps) {
            pr.maxReps = set.reps;
            pr.maxVolume = volume;
            pr.date = workout.completedAt;
            updated = true;
          }

          if (updated) {
            pr.isNew = new Date(workout.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          }
        }
      });
    });
  });

  return Array.from(prMap.values())
    .sort((a, b) => b.maxVolume - a.maxVolume)
    .slice(0, 5);
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function PersonalRecordsPreview({ limit = 3 }: PRPreviewProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [totalPRs, setTotalPRs] = useState(0);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    const history = await HistoryRepository.getAll();
    const allRecords = calculatePRs(history);
    setTotalPRs(allRecords.length);
    setRecords(allRecords.slice(0, limit));
  }

  if (records.length === 0) {
    return (
      <Card variant="outlined" padding="lg">
        <div className="flex flex-col items-center gap-4 text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
            <FiAward size={32} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">No Personal Records Yet</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Complete your first workout to see your PRs here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <FiAward size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
              Personal Records
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{totalPRs} exercises tracked</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/analytics?tab=records")}
          className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          View All
          <FiChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {records.map((record, index) => (
          <motion.div
            key={record.exerciseName}
            variants={listItem}
            style={{ transitionDelay: reduceMotion ? "0s" : `${index * 0.06}s` }}
            className={cn(
              "group relative flex items-center gap-4 rounded-xl p-3 transition-all duration-200",
              "bg-zinc-50/50 hover:bg-zinc-100/80 dark:bg-white/3 dark:hover:bg-white/6",
              record.isNew && "ring-2 ring-amber-500/30 dark:ring-amber-500/20"
            )}
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-extrabold text-sm">
              {index + 1}
            </div>

            {/* Exercise Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-950 dark:text-white truncate">
                {record.exerciseName}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <FiTrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  {record.maxWeight} kg × {record.maxReps}
                </span>
                <span className="flex items-center gap-1">
                  <FiAward size={12} className="text-amber-500" aria-hidden="true" />
                  {record.maxVolume.toLocaleString()} kg vol
                </span>
              </div>
            </div>

            {/* Date & New Badge */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatRelativeTime(record.date)}
              </span>
              {record.isNew && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  <FiTrendingUp size={8} aria-hidden="true" />
                  NEW
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary footer */}
      <div className="mt-5 pt-4 border-t border-zinc-200/60 dark:border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-extrabold tabular-nums text-zinc-950 dark:text-white sm:text-2xl">
              {records.reduce((sum, r) => sum + r.maxVolume, 0).toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total PR Volume</p>
          </div>
          <div>
            <p className="text-xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300 sm:text-2xl">
              {totalPRs}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tracked Lifts</p>
          </div>
          <div>
            <p className="text-xl font-extrabold tabular-nums text-amber-700 dark:text-amber-300 sm:text-2xl">
              {records.filter(r => r.isNew).length}
            </p>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">New This Week</p>
          </div>
        </div>
      </div>
    </Card>
  );
}