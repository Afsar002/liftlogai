import { FiActivity, FiClock, FiLayers, FiTarget, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import Card from "../../../shared/components/ui/Card";
import AnimatedCard from "../../../shared/components/motion/AnimatedCard";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import { formatWorkoutTime } from "../utils/formatWorkoutTime";

interface Props {
  workout: WorkoutHistory;
  onDelete: (id: number) => void;
  onClick?: () => void;
}

export default function HistoryCard({ workout, onDelete, onClick }: Props) {
  const navigate = useNavigate();
  // Count only sets that exist in the saved history
  // (history already only contains completed sets after our fix)
  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0
  );

  // Count only exercises that have at least one set
  const exerciseCount = workout.exercises.filter(
    (exercise) => exercise.sets.length > 0
  ).length;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to workout detail page
      navigate(`/history/${workout.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <AnimatedCard>
        <Card hover padding="lg">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              {/* Workout Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
                <FiActivity size={22} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                  {workout.templateName}
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatWorkoutTime(workout.completedAt)}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workout.id!);
              }}
              aria-label="Delete workout"
              title="Delete workout"
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:text-zinc-500"
            >
              <FiTrash2 size={18} />
            </button>
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-zinc-100 dark:bg-white/6" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={<FiTarget />} label="Exercises" value={String(exerciseCount)} />
            <Stat icon={<FiClock />} label="Duration" value={`${workout.durationMinutes} min`} />
            <Stat icon={<FiLayers />} label="Sets" value={String(totalSets)} />
            <Stat icon={<FiActivity />} label="Volume" value={`${workout.totalVolume.toLocaleString()} kg`} />
          </div>
        </Card>
      </AnimatedCard>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 transition-colors duration-200 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/8">
      <div className="flex items-center justify-between gap-2">
        <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
