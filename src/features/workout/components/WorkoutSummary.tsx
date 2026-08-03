import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiCheckCircle } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";

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
  newPRs?: PersonalRecord[];
}

export default function WorkoutSummary({
  workoutName,
  duration,
  exercises,
  sets,
  volume,
  onSave,
  newPRs = [],
}: Props) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  return (
    <Card padding="lg">
      <div className="space-y-8">
        {/* Success */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 shadow-lg shadow-emerald-500/30"
          >
            <FiCheck size={48} className="text-emerald-950" aria-hidden="true" />
          </motion.div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Workout Complete
          </h2>

          <p className="mt-2 text-lg font-medium text-zinc-600 dark:text-zinc-300">
            {workoutName}
          </p>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Stat icon="⏱" value={duration} label="Duration" />
          <Stat icon="💪" value={String(exercises)} label="Exercises" />
          <Stat icon="✅" value={String(sets)} label="Completed Sets" />
          <Stat icon="🏋" value={`${volume.toLocaleString()} kg`} label="Total Volume" />
        </div>

        {/* PR Section */}
        {newPRs.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-500 dark:text-amber-400">
              🏆 New Personal Records
            </h3>

            <div className="space-y-2.5">
              {newPRs.map((pr, index) => (
                <div
                  key={`${pr.exerciseId}-${index}`}
                  className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 dark:bg-white/5"
                >
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {pr.exerciseName}
                  </span>
                  <span className="font-bold tabular-nums text-amber-500 dark:text-amber-400">
                    {pr.weight} kg × {pr.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              if (saving) return;
              setSaving(true);
              try {
                await onSave();
              } catch (e) {
                setSaving(false);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 py-4 text-lg font-bold text-emerald-950 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-400 hover:to-lime-300 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50"
          >
            <FiCheckCircle size={20} aria-hidden="true" />
            {saving ? "Saving Workout..." : "Finish & Save Workout"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => navigate("/")}
            className="w-full rounded-full border border-zinc-300 bg-white py-4 text-lg font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/12 dark:bg-[#141417] dark:text-zinc-300 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Card>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 text-center dark:bg-white/5">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm dark:bg-white/8">
        {icon}
      </div>
      <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-zinc-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
    </div>
  );
}
