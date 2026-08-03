import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  const variants = {
    default:
      "bg-zinc-100 text-zinc-600 dark:bg-white/8 dark:text-zinc-300",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    warning:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
    danger:
      "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    info:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
