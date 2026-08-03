import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../shared/lib/cn";

interface ProgressRingStackProps {
  /** Array of ring data: label, value (0-1), color, icon? */
  rings: Array<{
    label: string;
    value: number;
    color: string;
    gradient?: string;
    icon?: React.ReactNode;
  }>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { size: 64, stroke: 6, font: "text-xs", label: "text-xs", gap: "gap-4" },
  md: { size: 80, stroke: 8, font: "text-sm", label: "text-sm", gap: "gap-5" },
  lg: { size: 100, stroke: 10, font: "text-base", label: "text-base", gap: "gap-6" },
};

/**
 * Apple Fitness-style progress ring stack.
 * Multiple rings animate in sequentially with staggered delay.
 */
export default function ProgressRingStack({
  rings,
  size = "md",
  className,
}: ProgressRingStackProps) {
  const reduceMotion = useReducedMotion();
  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-end justify-center", config.gap, className)}>
      {rings.map((ring, index) => {
        const radius = (config.size - config.stroke) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - Math.max(0, Math.min(1, ring.value)));

        return (
          <motion.div
            key={ring.label}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              delay: reduceMotion ? 0 : index * 0.08,
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="flex flex-col items-center"
          >
            <div
              className="relative flex items-center justify-center"
              style={{ width: config.size, height: config.size }}
            >
              <svg className={`h-full w-full -rotate-90`} viewBox={`0 0 ${config.size} ${config.size}`}>
                {/* Background track */}
                <circle
                  cx={config.size / 2}
                  cy={config.size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={config.stroke}
                  className="text-zinc-200/80 dark:text-white/15"
                />
                {/* Progress ring */}
                <motion.circle
                  cx={config.size / 2}
                  cy={config.size / 2}
                  r={radius}
                  fill="none"
                  stroke={ring.gradient ? `url(#${ring.gradient.replace("#", "")})` : ring.color}
                  strokeWidth={config.stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={reduceMotion ? offset : circumference}
                  strokeLinecap="round"
                  className={cn("text-emerald-600", ring.color)}
                  animate={{
                    strokeDashoffset: offset,
                  }}
                  transition={{
                    delay: reduceMotion ? 0 : index * 0.08 + 0.1,
                    type: "spring",
                    stiffness: 280,
                    damping: 25,
                    duration: 1.2,
                  }}
                />
                {ring.gradient && (
                  <defs>
                    <linearGradient id={ring.gradient.replace("#", "")} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={ring.color} />
                      <stop offset="100%" stopColor={ring.gradient} />
                    </linearGradient>
                  </defs>
                )}
              </svg>
              {ring.icon && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {ring.icon}
                </div>
              )}
            </div>
            <div className="mt-2 text-center">
              <p className={cn("font-bold tabular-nums", config.font)}>
                {Math.round(ring.value * 100)}%
              </p>
              <p className={cn("text-zinc-500 dark:text-zinc-400", config.label)}>
                {ring.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}