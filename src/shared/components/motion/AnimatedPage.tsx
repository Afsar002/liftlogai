import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { entrance, pageOrchestrator, pageSection } from "./variants";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
  /** Enable page-level staggered orchestration for direct children. */
  orchestrate?: boolean;
  /** Individual section stagger — wraps each child in a pageSection variant. */
  staggerChildren?: boolean;
}

/**
 * Page-level entrance with optional orchestration.
 * Replaces the old `.animate-page-in` CSS class so transitions are driven by
 * Motion and respect prefers-reduced-motion.
 *
 * When `orchestrate` is true, direct children receive `pageSection` variants
 * and animate in a staggered sequence. Use `staggerChildren` to wrap each child
 * in the orchestration.
 */
export default function AnimatedPage({
  children,
  className,
  orchestrate = false,
  staggerChildren = false,
}: AnimatedPageProps) {
  const reduceMotion = useReducedMotion();

  if (!orchestrate) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={entrance}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  // Wrap children for orchestration
  const childArray = Array.isArray(children) ? children : [children];
  const wrappedChildren = childArray.map((child, index) => (
    <motion.div
      key={index}
      variants={pageSection}
      initial="hidden"
      animate="show"
      custom={index}
    >
      {child}
    </motion.div>
  ));

  return (
    <motion.div
      variants={pageOrchestrator}
      initial="hidden"
      animate="show"
      className={className}
    >
      {staggerChildren ? wrappedChildren : children}
    </motion.div>
  );
}
