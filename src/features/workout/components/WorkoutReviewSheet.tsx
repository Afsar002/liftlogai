import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FiCheck, FiCheckCircle, FiShare2, FiDownload, FiX, FiActivity, FiAward, FiTrendingUp } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";

interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  achievedAt: string;
}

interface Props {
  workoutName: string;
  duration: string;
  exercises: number;
  sets: number;
  volume: number;
  onSave: () => Promise<void>;
  onClose: () => void;
  newPRs?: PersonalRecord[];
}

export default function WorkoutReviewSheet({
  workoutName,
  duration,
  exercises,
  sets,
  volume,
  onSave,
  onClose,
  newPRs = [],
}: Props) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion() ?? false;
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave();
      // Haptic feedback on save
      if (navigator.vibrate) {
        navigator.vibrate([30, 20, 30]);
      }
    } catch (e) {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    // Generate shareable image/card
    setShareOpen(true);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[100] flex max-h-[90vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-[#0B0B0D] dark:border-t dark:border-white/10"
        role="dialog"
        aria-modal="true"
        aria-label="Workout complete"
      >
        {/* Drag handle */}
        <div className="flex h-12 items-center justify-center">
          <motion.div
            className="h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-white/20"
            animate={reduceMotion ? undefined : { scaleX: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-8 space-y-6">
          {/* Header with close */}
          <div className="flex items-center justify-between">
            <div />
            <motion.button
              onClick={onClose}
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/8 dark:text-zinc-500 dark:hover:text-zinc-300"
              aria-label="Close"
            >
              <FiX size={20} />
            </motion.button>
          </div>

          {/* Success Animation */}
          <div className="text-center">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 shadow-xl shadow-emerald-500/40"
            >
              <FiCheck size={56} className="text-emerald-950" aria-hidden="true" />
            </motion.div>

            <motion.h2
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 380, damping: 32 }}
              className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white"
            >
              Workout Complete
            </motion.h2>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 380, damping: 32 }}
              className="mt-2 text-lg font-medium text-zinc-600 dark:text-zinc-300"
            >
              {workoutName}
            </motion.p>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 380, damping: 32 }}
              className="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </motion.p>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 380, damping: 32 }}
            className="grid grid-cols-2 gap-4"
          >
            <StatCard
              icon={<FiCheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />}
              value={duration}
              label="Duration"
              accent="emerald"
            />
            <StatCard
              icon={<FiActivity size={20} className="text-blue-600 dark:text-blue-400" />}
              value={String(exercises)}
              label="Exercises"
              accent="blue"
            />
            <StatCard
              icon={<FiTrendingUp size={20} className="text-purple-600 dark:text-purple-400" />}
              value={String(sets)}
              label="Completed Sets"
              accent="purple"
            />
            <StatCard
              icon={<FiAward size={20} className="text-amber-600 dark:text-amber-400" />}
              value={`${volume.toLocaleString()} kg`}
              label="Total Volume"
              accent="amber"
            />
          </motion.div>

          {/* PR Section */}
          {newPRs.length > 0 && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 380, damping: 32 }}
              className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-400">
                <FiAward size={20} aria-hidden="true" />
                New Personal Records
              </h3>

              <div className="space-y-2.5">
                {newPRs.map((pr, index) => (
                  <motion.div
                    key={`${pr.exerciseId}-${index}`}
                    initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.08, type: "spring", stiffness: 380, damping: 32 }}
                    className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 dark:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="font-medium text-zinc-950 dark:text-white">
                        {pr.exerciseName}
                      </span>
                    </div>
                    <span className="font-bold tabular-nums text-amber-700 dark:text-amber-300">
                      {pr.weight} kg × {pr.reps}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: newPRs.length > 0 ? 0.5 : 0.4, type: "spring", stiffness: 380, damping: 32 }}
            className="space-y-3"
          >
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={reduceMotion || saving ? undefined : { scale: 1.01 }}
              whileTap={reduceMotion || saving ? undefined : { scale: 0.99 }}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-extrabold shadow-xl transition-all",
                "bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 shadow-emerald-500/30",
                "hover:from-emerald-400 hover:to-lime-300",
                "focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                saving && "opacity-50 cursor-wait"
              )}
            >
              <FiCheckCircle size={20} aria-hidden="true" />
              {saving ? "Saving Workout..." : "Finish & Save Workout"}
            </motion.button>

            <motion.button
              onClick={() => setShareOpen(true)}
              whileHover={reduceMotion ? undefined : { scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white py-4 text-lg font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-white/12 dark:bg-[#141417] dark:text-zinc-300 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <FiShare2 size={20} aria-hidden="true" />
              Share Workout
            </motion.button>

            <motion.button
              onClick={() => navigate("/")}
              whileHover={reduceMotion ? undefined : { scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white py-3 text-base font-medium text-zinc-600 transition-all hover:bg-zinc-50 dark:border-white/12 dark:bg-[#141417] dark:text-zinc-400 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Share Sheet */}
      <AnimatePresence>
        {shareOpen && (
          <ShareSheet
            onClose={() => setShareOpen(false)}
            workoutName={workoutName}
            duration={duration}
            exercises={exercises}
            sets={sets}
            volume={volume}
            newPRs={newPRs}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
}) {
  const accentColors = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };

  return (
    <div className="rounded-2xl p-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/8">
        {icon}
      </div>
      <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-zinc-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function ShareSheet({
  onClose,
  workoutName,
  duration,
  exercises,
  sets,
  volume,
  newPRs,
  reduceMotion,
}: {
  onClose: () => void;
  workoutName: string;
  duration: string;
  exercises: number;
  sets: number;
  volume: number;
  newPRs: PersonalRecord[];
  reduceMotion: boolean;
}) {
  const [imageGenerated, setImageGenerated] = useState(false);

  const handleShare = () => {
    // Generate shareable image/card
    setImageGenerated(true);
    // In real implementation: use html2canvas or similar
    setTimeout(async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${workoutName} - LiftLog`,
            text: `Just completed ${workoutName}: ${volume.toLocaleString()}kg volume in ${duration} 💪`,
          });
        } catch (e) {
          // User cancelled or error
        }
      } else {
        // Fallback: copy to clipboard
        const text = `Just completed ${workoutName}: ${volume.toLocaleString()}kg volume in ${duration} 💪 #LiftLog`;
        await navigator.clipboard.writeText(text);
      }
      onClose();
    }, 500);
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[110] flex flex-col"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex-1 flex flex-col items-center justify-center p-6"
      >
        {/* Share Card Preview */}
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#141417] dark:border dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">LiftLog</span>
            <motion.button
              onClick={onClose}
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/8"
            >
              <FiX size={18} />
            </motion.button>
          </div>

          <div className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400">
              <FiCheck size={32} className="text-emerald-950" aria-hidden="true" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white">{workoutName}</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{duration} • {exercises} exercises • {sets} sets</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200/60 dark:border-white/10">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{volume.toLocaleString()} kg</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Volume</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{newPRs.length}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">New PRs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 380, damping: 32 }}
          className="mt-6 flex w-full max-w-sm flex-col gap-3"
        >
          <motion.button
            onClick={handleShare}
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 py-4 text-lg font-extrabold text-emerald-950 shadow-xl shadow-emerald-500/30"
          >
            <FiShare2 size={20} aria-hidden="true" />
            Share to Apps
          </motion.button>

          <motion.button
            onClick={onClose}
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white py-3 text-base font-medium text-zinc-600 hover:bg-zinc-50 dark:border-white/12 dark:bg-[#141417] dark:text-zinc-400 dark:hover:bg-white/5"
          >
            Cancel
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}