import {
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiLayers,
} from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";
import MetricCard from "../../../shared/components/ui/MetricCard";

import type { WeeklySummary } from "../types/WeeklySummary";

interface Props {
  summary: WeeklySummary;
}

export default function WeeklySummary({ summary }: Props) {
  const hours = Math.floor(summary.durationMinutes / 60);
  const minutes = summary.durationMinutes % 60;

  const duration =
    hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes} min`;

  return (
    <Card>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FiTrendingUp size={20} aria-hidden="true" />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Weekly Summary
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your progress for this week
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={<FiActivity />}
          title="Workouts"
          value={summary.workouts}
        />

        <MetricCard
          icon={<FiClock />}
          title="Duration"
          value={duration}
        />

        <MetricCard
          icon={<FiTrendingUp />}
          title="Volume"
          value={`${summary.totalVolume.toLocaleString()} kg`}
        />

        <MetricCard
          icon={<FiLayers />}
          title="Sets"
          value={summary.totalSets}
        />
      </div>
    </Card>
  );
}
