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

export default function StrengthChart({ data }: Props) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-slate-950 dark:text-white">
        Strength Progress
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
              }
            />

            <YAxis />

            <Tooltip formatter={(value) => [`${value} kg`, "Weight"]} />

            <Line
              type="monotone"
              dataKey="oneRM"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}