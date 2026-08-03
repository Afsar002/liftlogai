import Card from "../../../shared/components/ui/Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: string;
}

export default function MetricCard({
  title,
  value,
  suffix,
  icon,
}: MetricCardProps) {
  const iconMap: Record<string, string> = {
    workouts: "💪",
    volume: "🏋️",
    sets: "📊",
    time: "⏱️",
    average: "📈",
    streak: "🔥",
    prs: "🏆",
    favorite: "⭐",
  };

  return (
    <Card>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-lg">{iconMap[icon] || "📊"}</span>
        </div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {value}
          {suffix && <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-0.5">{suffix}</span>}
        </p>
      </div>
    </Card>
  );
}