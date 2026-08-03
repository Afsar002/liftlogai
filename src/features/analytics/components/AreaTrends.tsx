import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FiBarChart } from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";

interface Props {
  data: { day: string; volume: number }[];
  title?: string;
}

export default function AreaTrends({ data, title = "Volume Trend" }: Props) {
  return (
    <Card padding="lg" className="h-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Weekly progression overview
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
          <FiBarChart size={20} aria-hidden="true" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#a3e635" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(113, 113, 122, 0.2)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12, fontWeight: 500 }}
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
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#10b981"
            fill="url(#areaGradient)"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6, fill: "#059669" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
