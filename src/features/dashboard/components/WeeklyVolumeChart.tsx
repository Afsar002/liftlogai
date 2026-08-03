import { useEffect, useState } from "react";
import Card from "../../../shared/components/ui/Card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../../shared/lib/cn";
import { motion, useReducedMotion } from "framer-motion";

interface WeeklyVolumeData {
  day: string;
  volume: number;
  isToday: boolean;
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Weekly volume area chart with gradient fill.
 * Replaces the simple dot-based WeeklyProgress.
 */
export default function WeeklyVolumeChart() {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<WeeklyVolumeData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { HistoryRepository } = await import("../../history/repositories/HistoryRepository");
    const history = await HistoryRepository.getAll();

    const today = new Date().getDay(); // 0 = Sunday
    const weekData: WeeklyVolumeData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayWorkouts = history.filter((w) => {
        const completed = new Date(w.completedAt).getTime();
        return completed >= dayStart && completed < dayEnd;
      });

      const volume = dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
      weekData.push({
        day: dayNames[(date.getDay() + 6) % 7], // Adjust so Mon=0
        volume,
        isToday: i === 0,
      });
    }

    setData(weekData);
  }

  const maxVolume = Math.max(...data.map((d) => d.volume), 1);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
          Weekly Volume
        </h2>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {data.reduce((sum, d) => sum + d.volume, 0).toLocaleString()} kg total
        </span>
      </div>

      <div className="mt-5 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea875" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#0ea875" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(113,113,122,0.12)"
              vertical={false}
              horizontal={true}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#71717a", fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#71717a", fontWeight: 500 }}
              tickCount={4}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0e0e10",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "#fff", fontWeight: 700 }}
              formatter={(value: number) => [`${value.toLocaleString()} kg`, "Volume"]}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#0ea875"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#volumeGradient)"
              isAnimationActive={!reduceMotion}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Day indicators with volume */}
      <div className="mt-4 flex justify-between">
        {data.map((day) => (
          <motion.div
            key={day.day}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className={cn(
              "text-xs font-bold",
              day.isToday ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-500 dark:text-zinc-400"
            )}>
              {day.day}
            </span>
            <span className={cn(
              "text-[10px] font-bold tabular-nums",
              day.isToday ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-500 dark:text-zinc-400"
            )}>
              {day.volume > 0 ? `${Math.round(day.volume / 100) / 10}k` : "—"}
            </span>
            {/* Today indicator */}
            {day.isToday && (
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}