import { FiGrid } from "react-icons/fi";
import type { HeatmapDay } from "../types";

interface Props {
  data: HeatmapDay[];
}

function getColor(count: number) {
  if (count === 0) return "bg-slate-200 dark:bg-zinc-800";
  if (count === 1) return "bg-emerald-300 dark:bg-emerald-600";
  if (count === 2) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-700 dark:bg-emerald-400";
}

export default function WorkoutHeatmap({
  data,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Workout Heatmap
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Your training activity over time
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
            <FiGrid size={20} />
          </div>
        </div>

        <div className="text-sm text-zinc-500 dark:text-zinc-400">No heatmap data available.</div>
      </div>
    );
  }

  // Ensure the first day lines up under the correct weekday column
  const firstDay = new Date(data[0].date);
  const startOffset = firstDay.getDay();
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Workout Heatmap
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Your training activity over time
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
          <FiGrid size={20} />
        </div>
      </div>

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
        <div className="h-4 w-4 rounded bg-slate-200 dark:bg-zinc-800" />
        <div className="h-4 w-4 rounded bg-emerald-300 dark:bg-emerald-600" />
        <div className="h-4 w-4 rounded bg-emerald-500 dark:bg-emerald-500" />
        <div className="h-4 w-4 rounded bg-emerald-700 dark:bg-emerald-400" />
        <span>More</span>
      </div>
    </div>
  );
}