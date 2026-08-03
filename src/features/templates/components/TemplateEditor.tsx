import { useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiClock, FiPlus, FiRepeat, FiTrash2, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import type { WorkoutTemplateDB, TemplateExercise } from "../../../database/types";
import { TemplateRepository } from "../services/TemplateRepository";
import { ExerciseService } from "../../exercises/services/ExerciseService";
import ExercisePickerModal from "../../exercises/components/ExercisePickerModal";
import { cn } from "../../../shared/lib/cn";
import { estimateDuration, difficultyFor, totalSets, type Difficulty } from "../lib/templateMeta";

interface Props {
  template: WorkoutTemplateDB;
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
  Advanced: "bg-red-500/20 text-red-500 border-red-500/30",
};

function Stepper({
  label,
  value,
  display,
  min,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  display?: string;
  min: number;
  step?: number;
  onChange: (next: number) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-3 shadow-sm dark:border-white/8 dark:bg-[#141417]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-black text-zinc-600 transition hover:bg-zinc-200 active:scale-90 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
        >
          −
        </button>
        <motion.span
          key={value}
          initial={reduceMotion ? false : { scale: 0.85, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-base font-black tabular-nums text-zinc-900 dark:text-white"
        >
          {display ?? value}
        </motion.span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-black text-zinc-600 transition hover:bg-zinc-200 active:scale-90 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
        >
          +
        </button>
      </div>
    </div>
  );
}

/**
 * Program editor — live-updating gradient hero with editable name and stats,
 * exercise blocks with stepper inputs, and a picker to append exercises.
 * Same state logic as the old card-list editor, entirely new composition.
 */
export default function TemplateEditor({ template }: Props) {
  const [edited, setEdited] = useState<WorkoutTemplateDB>(template);
  const [showPicker, setShowPicker] = useState(false);
  const navigate = useNavigate();

  const duration = estimateDuration(edited.exercises);
  const difficulty = difficultyFor(edited.exercises);
  const sets = totalSets(edited.exercises);

  function updateExercise(index: number, updates: Partial<TemplateExercise>) {
    const exercises = [...edited.exercises];
    exercises[index] = { ...exercises[index], ...updates };
    setEdited({ ...edited, exercises });
  }

  function removeExercise(index: number) {
    setEdited({
      ...edited,
      exercises: edited.exercises.filter((_, i) => i !== index),
    });
  }

  async function addExercise(id: string) {
    const exercise = await ExerciseService.getExerciseById(id);
    if (!exercise) return;

    setEdited({
      ...edited,
      exercises: [
        ...edited.exercises,
        {
          // Use the stable exercise library ID so that workout sessions
          // created from this template can match history records by ID.
          // Previously this used crypto.randomUUID(), which broke
          // computePreviousBests() lookups in WorkoutSessionFactory.
          id: id,
          name: exercise.name,
          targetSets: 3,
          targetReps: "8-12",
          rest: 90,
        },
      ],
    });
  }

  async function save() {
    if (!edited.id) return;

    await TemplateRepository.update(edited.id, {
      ...edited,
      updatedAt: new Date().toISOString(),
    });

    toast.success("Template saved!");
    setTimeout(() => {
      navigate("/templates");
    }, 500);
  }

  return (
    <div className="space-y-6">
      {/* Editor hero */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-5 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/templates")}
              aria-label="Back to programs"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            >
              <FiArrowLeft size={14} aria-hidden="true" />
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
              Editing program
            </span>
            <div className="ml-auto">
              <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide", DIFFICULTY_STYLES[difficulty])}>
                {difficulty}
              </span>
            </div>
          </div>

          <input
            value={edited.name}
            onChange={(e) => setEdited({ ...edited, name: e.target.value })}
            aria-label="Program name"
            placeholder="Program name"
            className="mt-3 w-full border-none bg-transparent text-3xl font-black tracking-tight text-white outline-none placeholder:text-white/30"
          />

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-white/75">
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <FiClock size={10} aria-hidden="true" /> {duration}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <FiRepeat size={10} aria-hidden="true" /> {edited.exercises.length} ex.
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
              <FiZap size={10} aria-hidden="true" /> {sets} sets
            </span>
          </div>

          <motion.button
            type="button"
            onClick={save}
            whileTap={{ scale: 0.96 }}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 py-3 text-sm font-extrabold text-emerald-950 shadow-fab"
          >
            Save program
          </motion.button>
        </div>
      </div>

      {/* Exercise blocks */}
      {edited.exercises.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-zinc-300 py-14 text-center dark:border-white/10">
          <div className="text-5xl">🏋️</div>
          <h3 className="mt-4 text-xl font-black text-zinc-900 dark:text-white">
            No exercises yet
          </h3>
          <p className="mt-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Add your first exercise to start building this program.
          </p>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="mt-5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-2.5 text-sm font-extrabold text-emerald-950 shadow-fab"
          >
            Add exercise
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {edited.exercises.map((exercise, index) => (
            <motion.article
              key={exercise.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="rounded-3xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#141417]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-xs font-black text-emerald-400">
                  {index + 1}
                </span>
                <input
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, { name: e.target.value })}
                  aria-label="Exercise name"
                  className="min-w-0 flex-1 border-none bg-transparent text-base font-black tracking-tight text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  aria-label={`Remove ${exercise.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-500/10 hover:text-red-500 dark:text-zinc-500"
                >
                  <FiTrash2 size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Stepper
                  label="Sets"
                  value={exercise.targetSets}
                  min={1}
                  onChange={(next) => updateExercise(index, { targetSets: next })}
                />
                <div className="rounded-2xl border border-zinc-200/70 bg-white p-3 shadow-sm dark:border-white/8 dark:bg-[#141417]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Reps
                  </p>
                  <input
                    value={exercise.targetReps}
                    onChange={(e) => updateExercise(index, { targetReps: e.target.value })}
                    aria-label="Target reps"
                    className="mt-2 w-full border-none bg-transparent text-center text-base font-black tabular-nums text-zinc-900 outline-none dark:text-white"
                  />
                </div>
                <Stepper
                  label="Rest (s)"
                  value={exercise.rest}
                  min={0}
                  step={15}
                  display={`${exercise.rest}s`}
                  onChange={(next) => updateExercise(index, { rest: next })}
                />
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Add exercise */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-zinc-300 bg-white/60 py-5 text-sm font-bold text-zinc-600 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-400"
      >
        <FiPlus size={16} aria-hidden="true" />
        Add exercise
      </button>

      <ExercisePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={addExercise}
        existingNames={edited.exercises.map((exercise) => exercise.name)}
      />
    </div>
  );
}
