import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
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
    <Card>
      <div className="space-y-8 p-6">

        {/* Success */}
        <div className="text-center">
          <FiCheckCircle
            size={72}
            className="mx-auto text-green-400"
          />

          <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
            Workout Complete
          </h2>

          <p className="mt-2 text-lg text-slate-600 dark:text-zinc-300">
            {workoutName}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
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
          <Stat
            icon="⏱"
            value={duration}
            label="Duration"
          />

          <Stat
            icon="💪"
            value={String(exercises)}
            label="Exercises"
          />

          <Stat
            icon="✅"
            value={String(sets)}
            label="Completed Sets"
          />

          <Stat
            icon="🏋"
            value={`${volume.toLocaleString()} kg`}
            label="Total Volume"
          />
        </div>

        {/* PR Section */}
        {newPRs.length > 0 && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
            <h3 className="mb-4 text-lg font-bold text-yellow-400">
              🏆 New Personal Records
            </h3>

            <div className="space-y-3">
              {newPRs.map((pr, index) => (
                <div
                  key={`${pr.exerciseId}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-zinc-800"
                >
                  <span className="font-medium text-slate-950 dark:text-white">
                    {pr.exerciseName}
                  </span>

                  <span className="font-bold text-yellow-300">
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
            className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-black transition hover:bg-green-400 disabled:opacity-50"
          >
            {saving ? "Saving Workout..." : "Finish & Save Workout"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => navigate("/")}
            className="w-full rounded-xl border border-zinc-700 bg-white py-4 text-lg font-semibold text-slate-950 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 disabled:opacity-50"
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
    <div className="rounded-2xl bg-slate-100 p-5 text-center dark:bg-zinc-800">
      <div className="text-2xl">{icon}</div>

      <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-zinc-400">
        {label}
      </p>
    </div>
  );
}