import type { ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";
import { cn } from "../../lib/cn";

interface Props {
  icon?: ReactNode;
  title: string;

  subtitle?: string;

  value?: ReactNode;
  trailing?: ReactNode;

  danger?: boolean;
  clickable?: boolean;

  className?: string;

  onClick?: () => void;
}

export default function ListRow({
  icon,
  title,
  subtitle,
  value,
  trailing,
  danger = false,
  clickable = false,
  className,
  onClick,
}: Props) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              danger
                ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400"
            )}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0 text-left">
          <p
            className={cn(
              "font-medium",
              danger
                ? "text-red-600 dark:text-red-300"
                : "text-zinc-900 dark:text-white"
            )}
          >
            {title}
          </p>

          {subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {trailing ?? (
          value && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {value}
            </span>
          )
        )}

        {clickable && (
          <FiChevronRight className="text-zinc-400" />
        )}
      </div>
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-between",
          "rounded-xl px-3 py-3",
          "transition-colors duration-200",
          "hover:bg-zinc-100 dark:hover:bg-white/5",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between",
        "rounded-xl px-3 py-3",
        className
      )}
    >
      {content}
    </div>
  );
}
