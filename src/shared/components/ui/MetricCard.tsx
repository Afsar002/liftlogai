import type { ReactNode } from "react";

import Card from "./Card";
import { cn } from "../../lib/cn";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
  valueClassName?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  subtitle,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "group border border-zinc-200 bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h2
            className={cn(
              "mt-3 text-3xl font-extrabold tracking-tight",
              "text-zinc-900 dark:text-white",
              valueClassName
            )}
          >
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              "bg-blue-500/10 text-blue-400",
              "transition-all duration-300",
              "group-hover:scale-110 group-hover:bg-blue-500/20"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}