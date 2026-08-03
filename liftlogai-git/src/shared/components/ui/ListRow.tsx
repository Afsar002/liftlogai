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
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              danger
                ? "text-red-500 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            )}
          >
            {icon}
          </div>
        )}

        <div className="text-left">
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

      <div className="flex items-center gap-2">
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
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "focus:outline-none focus:ring-2 focus:ring-green-500/50",
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