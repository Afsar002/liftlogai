import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FiPieChart } from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";

interface Props {
  data: { name: string; value: number }[];
}

// Emerald/lime/teal family — a single athletic hue, not a rainbow.
const COLORS = [
  "#10b981",
  "#34d399",
  "#a3e635",
  "#84cc16",
  "#14b8a6",
  "#2dd4bf",
  "#4d7c0f",
  "#059669",
];

export default function DonutChart({ data }: Props) {
  return (
    <Card padding="lg" className="h-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Exercise Distribution
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Volume by exercise type
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
          <FiPieChart size={20} aria-hidden="true" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(11, 11, 13, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              color: "#fafafa",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
            labelStyle={{ color: "#a1a1aa", fontWeight: 600 }}
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
    </Card>
  );
}
