import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { spring, magnetic as magneticTransition, listItem } from "./variants";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  /** Subtle lift on hover. Disabled automatically under reduced motion. */
  lift?: boolean;
  /** Haptic-style press feedback. Disabled automatically under reduced motion. */
  pressable?: boolean;
  /** Magnetic hover effect — subtle cursor-follow. Disabled under reduced motion. */
  magnetic?: boolean;
  /** Stagger entrance when used in a list container. */
  stagger?: boolean;
  /** Index for stagger ordering (auto if in listContainer). */
  staggerIndex?: number;
}

/**
 * Wrapper that adds a subtle hover lift, press feedback, and optional magnetic
 * hover to a card. Compose an existing component (e.g. ExerciseCard, MetricCard)
 * inside it rather than creating one wrapper per card type.
 */
export default function AnimatedCard({
  children,
  className,
  lift = true,
  pressable = true,
  magnetic = false,
  stagger = false,
  staggerIndex,
}: AnimatedCardProps) {
  const reduceMotion = useReducedMotion();

  const hoverProps = reduceMotion || !lift
    ? undefined
    : magnetic
      ? { scale: 1.02 }
      : { y: -2 };

  return (
    <motion.div
      variants={stagger ? listItem : undefined}
      initial={stagger ? "hidden" : undefined}
      animate={stagger ? "show" : undefined}
      whileHover={hoverProps}
      whileTap={reduceMotion || !pressable ? undefined : { scale: 0.98 }}
      transition={magnetic ? magneticTransition : spring}
      className={className}
    >
      {children}
    </motion.div>
  );
}
