import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { listContainer } from "./variants";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Stagger container for lists/grids. Pair children with <AnimatedItem>.
 * Mount-time only — cheap, no re-animation on updates.
 */
export default function AnimatedList({
  children,
  className,
}: AnimatedListProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={listContainer}
      initial={reduceMotion ? "show" : "hidden"}
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}
