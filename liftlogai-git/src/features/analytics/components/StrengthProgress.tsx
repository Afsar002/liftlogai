import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { FiTrendingUp, FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";

import type { StrengthProgressPoint } from "../types";

interface Props {
  data: StrengthProgressPoint[];
}

export default function StrengthProgress({
  data,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <FiTrendingUp size={24} className="text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No strength data available yet.
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Complete workouts to track your progress
        </p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const first = data[0];
  const delta = latest.estimated1RM - first.estimated1RM;
  const deltaPercent = first.estimated1RM > 0 ? (delta / first.estimated1RM) * 100 : 0;

  const isUp = delta > 0;
  const isDown = delta < 0;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Gradient header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Strength Progress
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Estimated 1RM over time
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
          <FiTrendingUp size={20} />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Current 1RM
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
            {latest.estimated1RM.toFixed(1)}
            <span className="ml-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">
              kg
            </span>
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Overall Change
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`text-2xl font-bold ${
                isUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isDown
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-950 dark:text-white"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}
            </span>
            <span
              className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-xs font-semibold ${
                isUp
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : isDown
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              }`}
            >
              {isUp ? <FiArrowUp size={12} /> : isDown ? <FiArrowDown size={12} /> : <FiMinus size={12} />}
              {Math.abs(deltaPercent).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              color: "#f8fafc",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            labelStyle={{ color: "#cbd5e1", fontWeight: 600 }}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number) => [`${value.toFixed(1)} kg`, "Est. 1RM"]}
          />

          <Line
            type="monotone"
            dataKey="estimated1RM"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ fill: "#6366f1", r: 5, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}