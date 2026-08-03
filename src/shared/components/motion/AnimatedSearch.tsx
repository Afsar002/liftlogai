import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { entrance } from "./variants";

interface AnimatedSearchProps {
  /** Re-run the entrance when the query changes. */
  query: string;
  children: ReactNode;
  className?: string;
}

/**
 * Results container that re-animates when the search query changes.
 * No exit animation, so fast typing never lags.
 */
export default function AnimatedSearch({
  query,
  children,
  className,
}: AnimatedSearchProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={query}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={entrance}
      className={className}
    >
      {children}
    </motion.div>
  );
}
