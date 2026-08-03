import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export default function Card({
  children,
  className,
  padding = "md",
  hover = false,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm transition-all duration-150",
        "border-zinc-200/80 dark:border-zinc-800/80",
        "dark:bg-zinc-900/95",
        hover && "hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700",
        padding === "none" && "p-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}