import { motion, useReducedMotion } from "framer-motion";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { useWorkout } from "../context/WorkoutContext";
import { useWorkoutStats } from "../hooks/useWorkoutStats";
import { cn } from "../../../shared/lib/cn";
import { useState } from "react";

interface Props {
  onFinish: () => void;
  onCancel?: () => void;
}

export default function FinishWorkoutFab({ onFinish, onCancel }: Props) {
  const { session } = useWorkout();
  const stats = useWorkoutStats(session);
  const reduceMotion = useReducedMotion() ?? false;
  const [isPressed, setIsPressed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleFinish = async () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
    setIsPressed(true);
    setShowConfetti(true);
    onFinish();

    // Reset after animation
    setTimeout(() => {
      setIsPressed(false);
      setShowConfetti(false);
    }, 800);
  };

  return (
    <>
      {/* Main FAB */}
      <motion.button
        onClick={handleFinish}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl",
          "bg-gradient-to-br from-emerald-500 via-emerald-600 to-lime-400 text-emerald-950 font-extrabold",
          "shadow-fab transition-all duration-300",
          isPressed && "scale-95 shadow-fab-pressed"
        )}
        aria-label="Finish workout"
        style={{
          boxShadow: isPressed
            ? "0 4px 20px rgba(16, 185, 129, 0.4)"
            : "0 8px 30px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.15)"
        }}
      >
        <motion.span
          animate={{
            scale: isPressed ? 0.9 : 1,
            rotate: isPressed ? 360 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: reduceMotion ? 0 : 0.6,
          }}
        >
          <FiCheckCircle size={28} aria-hidden="true" />
        </motion.span>

        {/* Press ripple */}
        <motion.div
          initial={false}
          animate={{
            scale: isPressed ? 1.5 : 0,
            opacity: isPressed ? 0 : 0.4,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl bg-white/30 pointer-events-none"
        />
      </motion.button>

      {/* Stats preview on long press / hover desktop */}
      {!reduceMotion && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-28 right-6 z-40 flex w-56 flex-col rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:bg-[#141417]/95 dark:border dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-zinc-950 dark:text-white">Session Summary</span>
            <motion.button
              onClick={onCancel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/8"
              aria-label="Cancel"
            >
              <FiX size={18} />
            </motion.button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                {stats.totalVolume.toLocaleString()}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Volume (kg)
              </p>
            </div>
            <div className="rounded-xl bg-blue-500/10 p-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-blue-700 dark:text-blue-300">
                {stats.completedSets}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Sets Done
              </p>
            </div>
            <div className="rounded-xl bg-purple-500/10 p-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-purple-700 dark:text-purple-300">
                {stats.totalExercises}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Exercises
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-amber-700 dark:text-amber-300">
                {stats.durationMinutes}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Minutes
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confetti burst */}
      {showConfetti && (
        <ConfettiBurst reduceMotion={reduceMotion} />
      )}
    </>
  );
}

function ConfettiBurst({ reduceMotion }: { reduceMotion: boolean }) {
  const colors = ["#0ea875", "#a3e635", "#10b981", "#84cc16", "#22c55e"];
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    angle: (Math.random() * 360) * (Math.PI / 180),
    velocity: 200 + Math.random() * 300,
    delay: Math.random() * 0.2,
  }));

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ overflow: "visible" }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos(p.angle) * p.velocity,
            y: Math.sin(p.angle) * p.velocity - 400,
            scale: [0, 1, 0],
            rotate: 720,
          }}
          transition={{
            delay: p.delay,
            duration: 0.8,
            ease: "easeOut",
          }}
          className="absolute bottom-1/2 left-1/2 h-3 w-3 rounded-full"
          style={{
            backgroundColor: p.color,
            transformOrigin: "center",
          }}
        />
      ))}
    </motion.div>
  );
}