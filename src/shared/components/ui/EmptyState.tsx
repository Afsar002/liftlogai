import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { motion } from "framer-motion";
import { entrance } from "../motion/variants";

interface EmptyStateProps {
  icon?: ReactNode;
  /** Lottie animation URL or component */
  lottie?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Visual variant */
  variant?: "default" | "illustrative" | "minimal";
  /** Illustration size */
  illustrationSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const illustrationSizes = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

export default function EmptyState({
  icon,
  lottie,
  title,
  description,
  action,
  variant = "default",
  illustrationSize = "md",
  className,
}: EmptyStateProps) {
  const hasIllustration = lottie || icon;

  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={entrance}
      className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}
    >
      {hasIllustration && (
        <div className={cn(
          "mb-6 flex items-center justify-center rounded-3xl transition-all duration-300",
          "bg-gradient-to-br from-emerald-500/10 to-lime-400/10 dark:from-emerald-500/5 dark:to-lime-400/5",
          illustrationSizes[illustrationSize]
        )}>
          {lottie ? (
            <div className="flex items-center justify-center" aria-hidden="true">{lottie}</div>
          ) : (
            <div className="flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl" aria-hidden="true">
              {icon}
            </div>
          )}
        </div>
      )}

      <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-md">
        {title}
      </h3>
      {description && (
        <p className="mt-3 max-w-sm text-base leading-7 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </motion.div>
  );
}
