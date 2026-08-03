import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { listItem } from "./variants";

interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * Staggered child — must sit inside <AnimatedList>. Renders at its natural
 * state when used standalone, so it is safe to add anywhere.
 */
export default function AnimatedItem({
  children,
  className,
}: AnimatedItemProps) {
  return (
    <motion.div variants={listItem} className={className}>
      {children}
    </motion.div>
  );
}
