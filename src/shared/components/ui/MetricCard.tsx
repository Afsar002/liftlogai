import { motion } from "framer-motion";
import type { ReactNode } from "react";

import Card from "./Card";
import { cn } from "../../lib/cn";
import { spring, listItem } from "../motion/variants";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  subtitle?: string;
  /** Reserve accent for meaning (streak, completed, PRs, progress). */
  accent?: boolean;
  /** Optional trend indicator: "up" | "down" | "neutral" */
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  valueClassName?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  subtitle,
  accent = false,
  trend = "neutral",
  trendValue,
  className,
  valueClassName,
}: MetricCardProps) {
  const trendIcons = {
    up: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
      </svg>
    ),
  };

  const trendColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-500 dark:text-red-400",
    neutral: "text-zinc-400 dark:text-zinc-500",
  };

  return (
    <motion.div
      variants={listItem}
      whileHover={{ y: -4 }}
      transition={spring}
      className={cn("group h-full", className)}
    >
      <Card className="h-full transition-colors hover:shadow-card-hover" padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300">
              {title}
            </p>

            <h2
              className={cn(
                "mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums",
                accent
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-zinc-950 dark:text-white",
                valueClassName
              )}
            >
              {value}
            </h2>

            {(subtitle || trend !== "neutral" || trendValue) && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {subtitle && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
                )}
                {trend !== "neutral" && (
                  <span className={cn("inline-flex items-center gap-1 text-xs font-bold", trendColors[trend])}>
                    {trendIcons[trend]}
                    {trendValue}
                  </span>
                )}
              </div>
            )}
          </div>

          {icon && (
            <div
              className={cn(
                "flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-110",
                accent
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/25"
                  : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300 group-hover:bg-zinc-200 dark:group-hover:bg-white/15"
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
