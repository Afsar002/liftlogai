import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "neutral";
}

/**
 * Icon chip. Neutral by default (accent reserved for meaning); use `primary`
 * sparingly for streak/completed moments.
 */
export default function IconWrapper({
  children,
  className,
  size = "md",
  variant = "neutral",
}: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl transition-colors",

        size === "sm" && "h-10 w-10",
        size === "md" && "h-12 w-12",
        size === "lg" && "h-14 w-14",

        variant === "primary" && [
          "bg-emerald-100 text-emerald-600",
          "dark:bg-emerald-500/15 dark:text-emerald-400",
        ],

        variant === "success" && [
          "bg-emerald-100 text-emerald-600",
          "dark:bg-emerald-500/15 dark:text-emerald-400",
        ],

        variant === "warning" && [
          "bg-yellow-100 text-yellow-600",
          "dark:bg-yellow-500/15 dark:text-yellow-400",
        ],

        variant === "danger" && [
          "bg-red-100 text-red-600",
          "dark:bg-red-500/15 dark:text-red-400",
        ],

        variant === "neutral" && [
          "bg-zinc-100 text-zinc-600",
          "dark:bg-white/8 dark:text-zinc-300",
        ],

        className
      )}
    >
      {children}
    </div>
  );
}
