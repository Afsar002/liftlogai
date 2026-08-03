import { FiGrid } from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";
import type { HeatmapDay } from "../types";

interface Props {
  data: HeatmapDay[];
}

function getColor(count: number) {
  if (count === 0) return "bg-zinc-200 dark:bg-white/8";
  if (count === 1) return "bg-emerald-300 dark:bg-emerald-600";
  if (count === 2) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-700 dark:bg-emerald-400";
}

function HeatmapHeader() {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
          Workout Heatmap
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your training activity over time
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
        <FiGrid size={20} aria-hidden="true" />
      </div>
    </div>
  );
}

export default function WorkoutHeatmap({
  data,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <Card padding="lg">
        <HeatmapHeader />
        <div className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No heatmap data available.
        </div>
      </Card>
    );
  }

  // Ensure the first day lines up under the correct weekday column
  const firstDay = new Date(data[0].date);
  const startOffset = firstDay.getDay();
  return (
    <Card padding="lg">
      <HeatmapHeader />

      <div className="grid grid-cols-7 gap-2">
        {/* Weekday headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (d) => (
            <div
              key={d}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              {d}
            </div>
          )
        )}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`pad-${i}`} className="h-6 w-6" />
        ))}

        {data.map((day) => (
          <div
            key={day.date}
            title={`${new Date(day.date).toLocaleDateString()}\n${day.count} workout(s)`}
            className={`h-6 w-6 rounded-md transition-transform hover:scale-110 ${getColor(day.count)}`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-700 dark:text-zinc-200">
          {data.length > 0
            ? `${new Date(data[0].date).toLocaleDateString()} — ${new Date(
                data[data.length - 1].date
              ).toLocaleDateString()}`
            : "No data"}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>Less</span>
        <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-white/8" />
        <div className="h-4 w-4 rounded bg-emerald-300 dark:bg-emerald-600" />
        <div className="h-4 w-4 rounded bg-emerald-500 dark:bg-emerald-500" />
        <div className="h-4 w-4 rounded bg-emerald-700 dark:bg-emerald-400" />
        <span>More</span>
      </div>
    </Card>
  );
}
