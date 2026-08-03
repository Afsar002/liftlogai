import {
  FiActivity,
  FiClock,
  FiLayers,
  FiTarget,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Card from "../../../shared/components/ui/Card";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import { formatWorkoutTime } from "../utils/formatWorkoutTime";

interface Props {
  workout: WorkoutHistory;
  onDelete: (id: number) => void;
  onClick?: () => void;
}

export default function HistoryCard({
  workout,
  onDelete,
  onClick,
}: Props) {
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
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <Card
        className="
          group
          overflow-hidden
          border
          border-zinc-200
          bg-white/95
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-blue-500/40
          hover:shadow-xl
          dark:border-zinc-800
          dark:bg-zinc-900/80
        "
      >
      <div className="p-6">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-4">

            {/* Workout Icon */}

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <FiActivity size={24} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                {workout.templateName}
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
            className="
              rounded-xl
              p-2
              text-red-400
              transition
              hover:bg-red-500/10
              hover:text-red-300
            "
          >
            <FiTrash2 size={18} />
          </button>

        </div>

        {/* Divider */}

        <div className="my-5 h-px bg-zinc-300 dark:bg-zinc-800" />

        {/* Stats */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <Stat
            icon={<FiTarget />}
            label="Exercises"
            value={String(exerciseCount)}
          />

          <Stat
            icon={<FiClock />}
            label="Duration"
            value={`${workout.durationMinutes} min`}
          />

          <Stat
            icon={<FiLayers />}
            label="Sets"
            value={String(totalSets)}
          />

          <Stat
            icon={<FiActivity />}
            label="Volume"
            value={`${workout.totalVolume.toLocaleString()} kg`}
          />

        </div>

      </div>
    </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        bg-slate-50/90
        p-4
        transition
        duration-300
        hover:bg-slate-100/90
        dark:bg-zinc-800/70
        dark:hover:bg-zinc-700/70
      "
    >
      <div className="flex items-center justify-between">

        <span className="text-blue-400">
          {icon}
        </span>

        <span className="text-xs uppercase tracking-wider text-zinc-500">
          {label}
        </span>

      </div>

      <p className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}