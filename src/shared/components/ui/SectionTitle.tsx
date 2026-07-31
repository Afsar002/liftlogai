import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  action,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-5 flex items-start justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}