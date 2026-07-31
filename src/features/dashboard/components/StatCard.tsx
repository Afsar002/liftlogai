import Card from "../../../shared/components/ui/Card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-green-500 dark:text-green-400">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {value}
        </p>
      </div>
    </Card>
  );
}