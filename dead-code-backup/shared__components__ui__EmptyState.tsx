import type { IconType } from "react-icons";
import { cn } from "../../lib/cn";

interface Props {
  icon: IconType;
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "px-6 py-12 text-center",
        className
      )}
    >
      <div
        className={cn(
          "mb-5 flex h-16 w-16 items-center justify-center rounded-full",
          "bg-zinc-100 dark:bg-zinc-800"
        )}
      >
        <Icon
          size={32}
          className="text-zinc-500 dark:text-zinc-400"
        />
      </div>

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}