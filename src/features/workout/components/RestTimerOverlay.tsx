import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { useRestTimer } from "../context/RestTimerContext";
import { cn } from "../../../shared/lib/cn";
import { useEffect } from "react";

interface Props {
  onClose?: () => void;
}

export default function RestTimerOverlay({ onClose }: Props) {
  const {
    formatted,
    running,
    secondsLeft,
    duration,
    isIdle,
    pause,
    resume,
    reset,
    skip,
    voiceEnabled,
    setVoiceEnabled,
  } = useRestTimer();
  const reduceMotion = useReducedMotion();

  // Dismissing the overlay clears the active timer when no onClose is provided
  const dismiss = onClose ?? skip;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") dismiss();
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      running ? pause() : resume();
    }
  };

  useEffect(() => {
    // Only attach the keyboard listener while the overlay is visible
    if (isIdle) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIdle, running, dismiss, pause, resume]);

  if (isIdle) {
    return null;
  }

  const progress = 1 - secondsLeft / duration;

  return (
    <AnimatePresence>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={dismiss}
        role="dialog"
        aria-modal="true"
        aria-label="Rest timer"
      >
        {/* Circular Progress Ring */}
        <motion.div
          initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative flex h-64 w-64 max-h-[40vh] max-w-[40vh] items-center justify-center"
        >
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-white/10"
            />
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#restGradient)"
              strokeWidth="8"
              strokeDasharray={283}
              strokeDashoffset={reduceMotion ? 283 * (1 - progress) : 283}
              strokeLinecap="round"
              className="text-emerald-400"
              animate={{ strokeDashoffset: 283 * (1 - progress) }}
              transition={{ duration: 1, ease: "linear" }}
            />
            <defs>
              <linearGradient id="restGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea875" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              key={formatted}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="text-center text-6xl font-extrabold tabular-nums tracking-tight text-white"
            >
              {formatted}
            </motion.p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/60">
              Rest
            </p>

            {/* Voice toggle */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setVoiceEnabled(!voiceEnabled);
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              aria-label={voiceEnabled ? "Disable voice cues" : "Enable voice cues"}
            >
              {voiceEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            </motion.button>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 380, damping: 32 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              pause();
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Pause"
          >
            <FiPause size={24} />
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              resume();
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 font-bold shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400"
            aria-label="Resume"
          >
            <FiPlay size={28} />
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Reset"
          >
            <FiRotateCcw size={24} />
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              skip();
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/80 text-white transition-colors hover:bg-red-500"
            aria-label="Skip rest"
          >
            <FiSkipForward size={24} />
          </motion.button>
        </motion.div>

        {/* Close hint */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 text-center text-sm font-medium text-white/50"
        >
          Tap outside or press Esc to dismiss
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}