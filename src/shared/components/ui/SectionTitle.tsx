import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { motion } from "framer-motion";
import { entrance } from "../motion/variants";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** Add a divider line */
  divider?: boolean;
  /** Divider style */
  dividerStyle?: "solid" | "dashed" | "gradient";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  action,
  divider = false,
  dividerStyle = "solid",
  size = "md",
  className,
}: SectionTitleProps) {
  const sizes = {
    sm: "text-xl font-bold",
    md: "text-2xl font-extrabold",
    lg: "text-3xl font-extrabold tracking-tight",
  };

  const dividerStyles = {
    solid: "border-t border-zinc-200 dark:border-white/6",
    dashed: "border-t border-dashed border-zinc-200 dark:border-white/6",
    gradient: "bg-gradient-to-r from-emerald-500 to-lime-400 h-0.5 rounded-full",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={entrance}
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={cn("tracking-tight text-zinc-900 dark:text-white", sizes[size])}>
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {divider && (
        <div className={cn("mt-3 w-full", dividerStyles[dividerStyle])} />
      )}
    </motion.div>
  );
}