import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { dialogOverlay, dialogPanel } from "./variants";

/** Animated modal backdrop (optionally wraps the panel as a centering container). */
export function AnimatedOverlay({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={dialogOverlay}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Animated modal panel — scale + rise into place. */
export function AnimatedPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={dialogPanel}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}
