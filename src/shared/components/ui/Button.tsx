import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/cn";
import { spring } from "../motion/variants";

// Exclude motion-specific props that conflict with HTML button attributes
type MotionExcludedProps = "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag" | "whileHover" | "whileTap" | "whileFocus" | "whileDrag" | "animate" | "initial" | "exit" | "transition" | "variants" | "custom" | "layout" | "layoutId" | "style";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionExcludedProps> {
  variant?:
    | "primary"
    | "gradient"
    | "secondary"
    | "ghost"
    | "danger"
    | "outline"
    | "glass"
    | "pill"
    | "fab";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  /** Add magnetic hover effect (subtle follow) */
  magnetic?: boolean;
}

const spinner = (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/**
 * Pill-shaped button. `primary` is the workhorse emerald CTA; `gradient` is
 * the emerald→lime signature action reserved for hero moments (Start/Finish
 * workout). `glass` for glassmorphism surfaces. `pill` for neutral pill.
 * `fab` for floating action buttons. Every secondary/ghost/outline stays neutral.
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  magnetic = false,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#08080A] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/25",
    gradient:
      "bg-gradient-to-r from-emerald-600 to-lime-400 text-emerald-950 hover:from-emerald-500 hover:to-lime-300 shadow-md shadow-emerald-600/30",
    secondary:
      "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-white/12 dark:text-white dark:hover:bg-white/16 dark:active:bg-white/20",
    ghost:
      "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-white/10 dark:active:bg-white/15",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/25",
    outline:
      "border border-zinc-400 text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100 dark:border-white/20 dark:text-white dark:hover:bg-white/8 dark:active:bg-white/12",
    glass:
      "glass text-zinc-950 dark:text-white hover:bg-white/40 dark:hover:bg-white/12 active:bg-white/60 dark:active:bg-white/25 shadow-glass",
    pill:
      "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-white/12 dark:text-white dark:hover:bg-white/16 dark:active:bg-white/20",
    fab:
      "bg-gradient-to-r from-emerald-600 to-lime-400 text-emerald-950 hover:from-emerald-500 hover:to-lime-300 shadow-fab hover:shadow-fab-hover",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
    xl: "px-8 py-4 text-lg gap-2.5",
  };

  const magneticStyle = magnetic && !reduceMotion
    ? "relative overflow-hidden"
    : "";

  const pressScale = reduceMotion ? 1 : 0.97;
  const hoverScale = reduceMotion ? 1 : 1.02;

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], magneticStyle, className)}
      disabled={disabled || loading}
      whileHover={magnetic && !reduceMotion ? { scale: hoverScale } : undefined}
      whileTap={!reduceMotion ? { scale: pressScale } : undefined}
      transition={spring}
      {...props}
    >
      {loading ? spinner : icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </motion.button>
  );
}
