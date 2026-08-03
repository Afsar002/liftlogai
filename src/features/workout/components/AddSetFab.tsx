import { motion, useReducedMotion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { useWorkout } from "../context/WorkoutContext";
import { cn } from "../../../shared/lib/cn";

interface Props {
  exerciseId: string;
}

export default function AddSetFab({ exerciseId }: Props) {
  const { addSet } = useWorkout();
  const reduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={() => addSet(exerciseId)}
      whileHover={reduceMotion ? undefined : { scale: 1.08, boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)" }}
      whileTap={reduceMotion ? undefined : { scale: 0.92 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl",
        "bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950 font-bold shadow-fab",
        "transition-all duration-300"
      )}
      aria-label="Add set"
      style={{
        boxShadow: isHovered && !reduceMotion
          ? "0 12px 40px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.2)"
          : "0 8px 30px rgba(16, 185, 129, 0.4)"
      }}
    >
      <motion.span
        animate={reduceMotion ? undefined : { rotate: isHovered ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <FiPlus size={24} aria-hidden="true" />
      </motion.span>

      {/* Ripple effect on press */}
      <motion.div
        initial={false}
        animate={{ scale: [0, 1], opacity: [0.5, 0] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 rounded-2xl bg-white/30 pointer-events-none"
      />
    </motion.button>
  );
}

import { useState } from "react";