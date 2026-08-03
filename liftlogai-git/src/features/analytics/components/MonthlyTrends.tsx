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
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Gradient header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Monthly Volume
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Long-term training progression
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
          <FiCalendar size={20} />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="mb-1 flex items-center gap-1.5">
            <FiBarChart size={14} className="text-blue-500" />
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Latest
            </p>
          </div>
          <p className="text-lg font-bold text-slate-950 dark:text-white">
            {latest ? `${(latest.volume / 1000).toFixed(1)}k` : "-"}
            <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
              kg
            </span>
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="mb-1 flex items-center gap-1.5">
            <FiActivity size={14} className="text-emerald-500" />
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Workouts
            </p>
          </div>
          <p className="text-lg font-bold text-slate-950 dark:text-white">
            {totalWorkouts}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="mb-1 flex items-center gap-1.5">
            <FiCalendar size={14} className="text-indigo-500" />
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Avg/Mo
            </p>
          </div>
          <p className="text-lg font-bold text-slate-950 dark:text-white">
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
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) =>
              value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : String(value)
            }
          />

          <Tooltip
            cursor={{
              stroke: "#6366f1",
              strokeWidth: 2,
              strokeDasharray: "4 4",
            }}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              color: "#f8fafc",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            labelStyle={{ color: "#cbd5e1", fontWeight: 600 }}
            formatter={(value: number) => [`${value.toLocaleString()} kg`, "Volume"]}
          />

          <Line
            type="monotone"
            dataKey="volume"
            stroke="url(#monthlyGradient)"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}