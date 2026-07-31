import { cn } from "../../lib/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
}

export default function Skeleton({
  className,
  variant = "text",
}: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circular: "h-10 w-10 rounded-full",
    rectangular: "h-32 w-full rounded-xl",
    card: "h-40 w-full rounded-xl",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-200 dark:bg-zinc-800",
        variants[variant],
        className
      )}
      aria-hidden="true"
    />
  );
}