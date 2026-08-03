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

export default function WeeklySummary({
  summary,
}: Props) {
  const hours = Math.floor(summary.durationMinutes / 60);
  const minutes = summary.durationMinutes % 60;

  const duration =
    hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes} min`;

  return (
<Card className="mb-8 border border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
  <div className="mb-5 flex items-center gap-2">
  <div className="rounded-lg bg-blue-500/10 p-2">
    <FiTrendingUp className="text-blue-400" size={20} />
  </div>

  <div>
    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
      Weekly Summary
    </h2>

    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      Your progress for this week
    </p>
  </div>
</div>

<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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