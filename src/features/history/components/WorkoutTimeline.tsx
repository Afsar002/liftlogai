import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiChevronRight, FiClock, FiTrash2, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import { cn } from "../../../shared/lib/cn";

function durationText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface Props {
  history: WorkoutHistory[];
  onDelete: (id: number) => void;
}

function dayLabel(dateStr: string): string {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return target.toLocaleDateString("en-US", { weekday: "long" });
  return target.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function timeOfDay(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Vertical activity timeline — each workout is a node on a rail with a time
 * stamp, volume and a chevron. Replaces the plain grouped card stack with a
 * scannable "journey" read.
 */
export default function WorkoutTimeline({ history, onDelete }: Props) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  if (history.length === 0) return null;

  return (
    <div className="relative pl-5">
      {/* The rail */}
      <div className="absolute bottom-4 left-[7px] top-2 w-px bg-zinc-200 dark:bg-white/10" />

      <div className="space-y-4">
        {history.map((workout, index) => {
          const sets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
          return (
            <motion.div
              key={workout.id ?? index}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 30 }}
              className="relative"
            >
              {/* Node dot */}
              <span
                className={cn(
                  "absolute -left-5 top-5 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full border-2",
                  "border-base-50 dark:border-[#0B0B0D]",
                  index === 0
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-500 to-lime-400"
                    : "border-zinc-300 bg-zinc-200 dark:border-white/20 dark:bg-white/15"
                )}
              />

              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-3.5 shadow-sm transition-colors hover:border-zinc-300 dark:border-white/8 dark:bg-[#141417]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FiActivity size={18} aria-hidden="true" />
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/history/${workout.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-extrabold uppercase tracking-widest", index === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500")}>
                      {dayLabel(workout.completedAt)}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                      · {timeOfDay(workout.completedAt)}
                    </span>
                  </div>
                  <h3 className="truncate text-sm font-bold text-zinc-950 dark:text-white">
                    {workout.templateName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <FiClock size={11} aria-hidden="true" />
                      {durationText(workout.durationMinutes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiZap size={11} className="text-emerald-500" aria-hidden="true" />
                      <span className="tabular-nums">{workout.totalVolume.toLocaleString()} kg</span>
                    </span>
                    <span>{workout.exercises.length} exercises · {sets} sets</span>
                  </div>
                </button>

                <FiChevronRight size={16} className="shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => workout.id && onDelete(workout.id)}
                  aria-label="Delete workout"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-zinc-600"
                >
                  <FiTrash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
