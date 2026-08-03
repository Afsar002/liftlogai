import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FiCalendar, FiBarChart, FiActivity } from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";
import type { MonthlyTrend } from "../types";

interface Props {
  data: MonthlyTrend[];
}

export default function MonthlyTrends({
  data,
}: Props) {
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const totalWorkouts = data.reduce((sum, m) => sum + m.workouts, 0);
  const avgVolume =
    data.length > 0
      ? Math.round(data.reduce((sum, m) => sum + m.volume, 0) / data.length)
      : 0;

  return (
    <Card padding="lg">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Monthly Volume
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Long-term training progression
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
          <FiCalendar size={20} aria-hidden="true" />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-white/5">
          <div className="mb-1 flex items-center gap-1.5">
            <FiBarChart size={14} className="text-zinc-500 dark:text-zinc-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Latest
            </p>
          </div>
          <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">
            {latest ? `${(latest.volume / 1000).toFixed(1)}k` : "-"}
            <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
              kg
            </span>
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-white/5">
          <div className="mb-1 flex items-center gap-1.5">
            <FiActivity size={14} className="text-zinc-500 dark:text-zinc-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Workouts
            </p>
          </div>
          <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">
            {totalWorkouts}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-white/5">
          <div className="mb-1 flex items-center gap-1.5">
            <FiCalendar size={14} className="text-zinc-500 dark:text-zinc-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Avg/Mo
            </p>
          </div>
          <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">
            {avgVolume > 0 ? `${(avgVolume / 1000).toFixed(1)}k` : "-"}
            <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
              kg
            </span>
          </p>
        </div>
      </div>

      <ResponsiveContainer
        width="100%"
        height={280}
      >
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="monthlyGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="rgba(113, 113, 122, 0.2)"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={(value) =>
              value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : String(value)
            }
          />

          <Tooltip
            cursor={{
              stroke: "#84cc16",
              strokeWidth: 2,
              strokeDasharray: "4 4",
            }}
            contentStyle={{
              backgroundColor: "rgba(11, 11, 13, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              color: "#fafafa",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
            labelStyle={{ color: "#a1a1aa", fontWeight: 600 }}
            formatter={(value: number) => [`${value.toLocaleString()} kg`, "Volume"]}
          />

          <Line
            type="monotone"
            dataKey="volume"
            stroke="url(#monthlyGradient)"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: "#84cc16", strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
