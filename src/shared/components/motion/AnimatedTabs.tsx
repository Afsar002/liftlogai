import { motion } from "framer-motion";
import { spring } from "./variants";
import { cn } from "../../lib/cn";

interface AnimatedTabIndicatorProps {
  /** Shared layoutId across the tab group so the pill glides between tabs. */
  layoutId: string;
  className?: string;
}

/**
 * Gliding active-tab pill. Render inside each tab button behind the label:
 *
 *   <button className="relative">
 *     {isActive && <AnimatedTabIndicator layoutId="tabs" />}
 *     <span className="relative z-10">Label</span>
 *   </button>
 */
export function AnimatedTabIndicator({
  layoutId,
  className,
}: AnimatedTabIndicatorProps) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={spring}
      className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400",
        className
      )}
    />
  );
}
