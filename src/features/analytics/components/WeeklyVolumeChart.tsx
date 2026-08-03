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

import Card from "../../../shared/components/ui/Card";

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
        <Card padding="lg" className="h-full">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                        Weekly Volume
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Training volume per day
                    </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
                    <FiTrendingUp size={20} aria-hidden="true" />
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#a3e635" stopOpacity={0.85} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        stroke="rgba(113, 113, 122, 0.2)"
                        strokeDasharray="3 3"
                        vertical={false}
                    />

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
                        tickFormatter={(value) =>
                            value >= 1000
                                ? `${(value / 1000).toFixed(1)}k`
                                : String(value)
                        }
                    />

                    <Tooltip
                        cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                        contentStyle={{
                            backgroundColor: "rgba(11, 11, 13, 0.95)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 16,
                            color: "#fafafa",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                        }}
                        labelStyle={{ color: "#a1a1aa", fontWeight: 600 }}
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
                                fill={entry.volume === maxValue ? "#a3e635" : "url(#barGradient)"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
