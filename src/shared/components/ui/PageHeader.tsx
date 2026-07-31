import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        "sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1
          className={cn(
            "text-3xl font-bold tracking-tight",
            "text-zinc-900 dark:text-white"
          )}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={cn(
              "mt-2 max-w-2xl text-sm leading-6",
              "text-zinc-500 dark:text-zinc-400"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}