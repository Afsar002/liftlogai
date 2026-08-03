import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FiPieChart } from "react-icons/fi";

interface Props {
  data: { name: string; value: number }[];
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export default function DonutChart({ data }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Gradient header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Exercise Distribution
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Volume by exercise type
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
          <FiPieChart size={20} />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              color: "#f8fafc",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            labelStyle={{ color: "#cbd5e1", fontWeight: 600 }}
          />

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            cornerRadius={8}
          >
            {data.map((_, index) => (
              <Cell 
                key={index} 
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.slice(0, 6).map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}