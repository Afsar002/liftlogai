import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  pressable?: boolean;
  variant?: "default" | "elevated" | "glass" | "outlined";
  interactive?: boolean;
}

/**
 * Unified card surface with multiple elevation variants.
 * - default: standard card with soft shadow (light) / hairline border (dark)
 * - elevated: stronger shadow for floating elements
 * - glass: glassmorphism with backdrop blur
 * - outlined: border-only, no shadow
 * Supports hover/press interactions with reduced-motion compliance.
 */
export default function Card({
  children,
  className,
  padding = "md",
  hover = false,
  pressable = false,
  variant = "default",
  interactive = false,
}: Props) {
  const isInteractive = interactive || hover || pressable;

  const variants = {
    default: "bg-white border border-zinc-200/80 dark:border-white/8 dark:bg-[#0e0e10] shadow-card dark:shadow-none",
    elevated: "bg-white border border-zinc-200/60 dark:border-white/6 dark:bg-[#141417] shadow-elevated dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)]",
    glass: "glass border-white/24 dark:border-white/12 shadow-glass",
    outlined: "bg-transparent border border-zinc-200/90 dark:border-white/16 shadow-none",
  };

  const hoverStyles = {
    default: "hover:shadow-card-hover hover:border-zinc-300 dark:hover:border-white/16",
    elevated: "hover:shadow-elevated-hover hover:border-zinc-300 dark:hover:border-white/20",
    glass: "hover:shadow-[0_12px_40px_-8px_rgba(9,9,11,0.15)] hover:border-white/30 dark:hover:border-white/24",
    outlined: "hover:border-zinc-300 dark:hover:border-white/24 hover:bg-zinc-50 dark:hover:bg-white/5",
  };

  const pressStyles = "active:shadow-card-pressed active:scale-[0.995] active:bg-zinc-50 dark:active:bg-white/5";

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200 ease-out",
        variants[variant],
        isInteractive && hoverStyles[variant],
        isInteractive && pressable && pressStyles,
        padding === "none" && "p-0",
        padding === "sm" && "p-4",
        padding === "md" && "p-5",
        padding === "lg" && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
