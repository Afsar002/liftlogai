import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import BackButton from "./BackButton";
import { motion } from "framer-motion";
import { entrance } from "../motion/variants";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /**
   * When provided, renders the standardized BackButton above the title.
   * `true` uses defaults (navigate back, no label); an object forwards
   * `to`/`onClick`/`label`/`ariaLabel` to it.
   */
  back?: boolean | {
    to?: string;
    label?: string;
    ariaLabel?: string;
    onClick?: () => void;
  };
  /** "page" = root screen title (display), "detail" = sub-screen title (2xl), "hero" = gradient hero with progress ring slot */
  size?: "page" | "detail" | "hero";
  /** Optional progress ring value (0-1) for hero variant */
  progress?: number;
  /** Optional progress ring label */
  progressLabel?: string;
  className?: string;
}

/**
 * Single page-header primitive for the whole app: large display title,
 * muted subtitle, action slot, and (when needed) a back button in a fixed
 * location above the title.
 * Hero variant includes gradient mesh background and progress ring slot.
 */
export default function PageHeader({
  title,
  subtitle,
  action,
  back,
  size = "page",
  progress,
  progressLabel,
  className,
}: Props) {
  const isHero = size === "hero";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={entrance}
      className={cn("flex flex-col", className)}
    >
      {isHero ? (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500/15 via-transparent to-lime-400/15 dark:from-emerald-500/10 dark:via-transparent dark:to-lime-400/10 p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-lime-400/5" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              {back && (
                <div className="mb-3">
                  <BackButton {...(typeof back === "object" ? back : undefined)} />
                </div>
              )}
              <h1 className="font-extrabold tracking-tight text-zinc-900 dark:text-white text-4xl sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-600 dark:text-zinc-300">
                  {subtitle}
                </p>
              )}
              {(progress !== undefined || progressLabel) && (
                <div className="mt-5 flex items-center gap-4">
                  {progress !== undefined && (
                    <div className="relative flex h-14 w-14 items-center justify-center">
                      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-zinc-200 dark:text-white/10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray={283}
                          strokeDashoffset={283 * (1 - progress)}
                          strokeLinecap="round"
                          className="text-emerald-500"
                          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#a3e635" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-zinc-900 dark:text-white">
                        {Math.round(progress * 100)}%
                      </span>
                    </div>
                  )}
                  {progressLabel && (
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{progressLabel}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">of daily goal</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {action && <div className="shrink-0">{action}</div>}
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {back && (
              <div className="mb-3">
                <BackButton {...(typeof back === "object" ? back : undefined)} />
              </div>
            )}
            <h1
              className={cn(
                "font-extrabold tracking-tight text-zinc-900 dark:text-white",
                size === "detail"
                  ? "text-2xl sm:text-3xl"
                  : "text-4xl sm:text-5xl"
              )}
            >
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </motion.header>
  );
}
