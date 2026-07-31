import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    YAxis,
    Cell,
} from "recharts";
import { FiTrendingUp } from "react-icons/fi";

interface Props {
    data: {
        day: string;
        volume: number;
    }[];
}

export default function WeeklyVolumeChart({
    data,
}: Props) {
    const maxValue = Math.max(...data.map(d => d.volume), 1);
    
    return (
        <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Gradient header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                        Weekly Volume
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Training volume per day
                    </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                    <FiTrendingUp size={20} />
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                            <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="day"
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
                        cursor={{ fill: "rgba(34, 197, 94, 0.08)" }}
                        contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            borderRadius: 12,
                            color: "#f8fafc",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        }}
                        labelStyle={{ color: "#cbd5e1", fontWeight: 600 }}
                    />

                    <Bar
                        dataKey="volume"
                        fill="url(#barGradient)"
                        radius={[8, 8, 0, 0]}
                        barSize={32}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.volume === maxValue ? "#22c55e" : "url(#barGradient)"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}