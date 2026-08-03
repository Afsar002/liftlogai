import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  /** Reserve accent for meaning (streak, completed). */
  accent?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  accent = false,
}: StatCardProps) {
  return (
    <Card className="h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </span>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              accent
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400"
            )}
          >
            {icon}
          </span>
        </div>
        <p
          className={cn(
            "text-2xl font-extrabold tracking-tight tabular-nums",
            accent
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-900 dark:text-white"
          )}
        >
          {value}
        </p>
      </div>
    </Card>
  );
}
