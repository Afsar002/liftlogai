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

import Card from "../../../shared/components/ui/Card";
import type { StrengthProgressPoint } from "../types";

interface Props {
  data: StrengthProgressPoint[];
}

export default function StrengthProgress({
  data,
}: Props) {
  if (data.length === 0) {
    return (
      <Card padding="lg">
        <div className="py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/8">
            <FiTrendingUp size={24} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No strength data available yet.
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Complete workouts to track your progress
          </p>
        </div>
      </Card>
    );
  }

  const latest = data[data.length - 1];
  const first = data[0];
  const delta = latest.estimated1RM - first.estimated1RM;
  const deltaPercent = first.estimated1RM > 0 ? (delta / first.estimated1RM) * 100 : 0;

  const isUp = delta > 0;
  const isDown = delta < 0;

  return (
    <Card padding="lg" className="h-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Strength Progress
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Estimated 1RM over time
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
          <FiTrendingUp size={20} aria-hidden="true" />
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Current 1RM
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
            {latest.estimated1RM.toFixed(1)}
            <span className="ml-1 text-sm font-normal text-zinc-500 dark:text-zinc-400">
              kg
            </span>
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Overall Change
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`text-2xl font-bold tabular-nums tracking-tight ${
                isUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isDown
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-zinc-900 dark:text-white"
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
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(113, 113, 122, 0.2)" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
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
            tick={{ fill: "#71717a", fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(11, 11, 13, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              color: "#fafafa",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
            labelStyle={{ color: "#a1a1aa", fontWeight: 600 }}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number) => [`${value.toFixed(1)} kg`, "Est. 1RM"]}
          />

          <Line
            type="monotone"
            dataKey="estimated1RM"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 5, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: "#84cc16", strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
