import { FiTrendingUp } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  data: {
    date: string;
    oneRM: number;
  }[];
};

/**
 * Strength progress line chart — restyled to the OBSIDIAN card language
 * (rounded panel, header row, emerald series) with identical data mapping.
 */
export default function StrengthChart({ data }: Props) {
  return (
    <section className="rounded-3xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#141417]">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FiTrendingUp size={15} aria-hidden="true" />
        </span>
        <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
          Strength progress
        </h2>
        <span className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Estimated 1RM
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <XAxis
              dataKey="date"
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
              }
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor", className: "text-zinc-400 dark:text-zinc-500" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "currentColor", className: "text-zinc-400 dark:text-zinc-500" }}
            />
            <Tooltip
              formatter={(value) => [`${value} kg`, "Est. 1RM"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#18181b",
                color: "#fff",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="oneRM"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
