import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FiClock, FiCopy, FiEdit2, FiMoreVertical, FiPlay, FiRepeat, FiTrash2, FiZap } from "react-icons/fi";
import { Menu } from "@headlessui/react";
import type { WorkoutTemplateDB } from "../../../database/types";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";
import {
  estimateDuration,
  difficultyFor,
  muscleGroups,
  totalSets,
  type Difficulty,
} from "../lib/templateMeta";

interface Props {
  template: WorkoutTemplateDB;
  featured?: boolean;
  onStart: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const COVERS: { gradient: string; glow: string; glyph: string }[] = [
  { gradient: "from-emerald-500/30 via-teal-500/20 to-transparent", glow: "bg-emerald-400/30", glyph: "🏋️" },
  { gradient: "from-orange-500/30 via-amber-500/15 to-transparent", glow: "bg-orange-400/30", glyph: "🔥" },
  { gradient: "from-violet-500/30 via-fuchsia-500/15 to-transparent", glow: "bg-violet-400/30", glyph: "⚡" },
  { gradient: "from-sky-500/30 via-cyan-500/15 to-transparent", glow: "bg-sky-400/30", glyph: "💪" },
  { gradient: "from-rose-500/30 via-pink-500/15 to-transparent", glow: "bg-rose-400/30", glyph: "🎯" },
];

function coverFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return COVERS[hash % COVERS.length];
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  Intermediate: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
  Advanced: "bg-red-500/20 text-red-500 border-red-500/30",
};

/**
 * Workout program card — gradient cover artwork, difficulty badge, estimated
 * duration, muscle chips, expandable exercise preview and a Start CTA. This
 * replaced the old white card + Start-button list.
 */
export default function ProgramCard({
  template,
  featured = false,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const cover = coverFor(template.name);
  const duration = estimateDuration(template.exercises);
  const difficulty = difficultyFor(template.exercises);
  const muscles = muscleGroups(template.exercises);
  const sets = totalSets(template.exercises);

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="overflow-hidden rounded-3xl border border-zinc-200/70 bg-white shadow-sm transition-colors hover:border-zinc-300 dark:border-white/8 dark:bg-[#141417]"
    >
      {/* Cover */}
      <div className={cn("relative overflow-hidden bg-zinc-950 p-5", featured ? "min-h-[9.5rem]" : "min-h-[8rem]")}>
        <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", cover.gradient)} />
        <div className={cn("pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl", cover.glow)} />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/50">
                Program
              </span>
              <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide", DIFFICULTY_STYLES[difficulty])}>
                {difficulty}
              </span>
            </div>
            <h2 className={cn("mt-1.5 truncate font-black tracking-tight text-white", featured ? "text-2xl" : "text-xl")}>
              {template.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-white/75">
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                <FiClock size={10} aria-hidden="true" /> {duration}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                <FiRepeat size={10} aria-hidden="true" /> {template.exercises.length} ex.
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                <FiZap size={10} aria-hidden="true" /> {sets} sets
              </span>
            </div>
          </div>

          <span className="pointer-events-none select-none text-4xl leading-none drop-shadow-lg">{cover.glyph}</span>
        </div>

        {/* Muscle chips */}
        {muscles.length > 0 && (
          <div className="relative mt-3 flex flex-wrap gap-1.5">
            {muscles.map((muscle) => (
              <span key={muscle} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
                {muscle}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Preview chips */}
        <div className="flex flex-wrap gap-1.5">
          {template.exercises.slice(0, 3).map((exercise) => (
            <span key={exercise.id} className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-white/6 dark:text-zinc-300">
              {exercise.name}
            </span>
          ))}
          {template.exercises.length > 3 && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:bg-white/6 dark:text-emerald-400"
            >
              +{template.exercises.length - 3} more
            </button>
          )}
        </div>

        {/* Expandable exercise list */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-1.5">
                {template.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-white/5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-extrabold text-zinc-500 shadow-sm dark:bg-white/8 dark:text-zinc-300">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {exercise.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-bold tabular-nums text-zinc-500 dark:text-zinc-400">
                      {exercise.targetSets}×{exercise.targetReps}
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                      {exercise.rest}s rest
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <motion.button
            type="button"
            onClick={onStart}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={spring}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 py-3 text-sm font-extrabold text-emerald-950 shadow-fab"
          >
            <FiPlay size={15} aria-hidden="true" />
            Start
          </motion.button>

          <Menu as="div" className="relative">
            <Menu.Button
              aria-label={`Actions for ${template.name}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 dark:border-white/8 dark:text-zinc-400 dark:hover:bg-white/8"
            >
              <FiMoreVertical size={17} aria-hidden="true" />
            </Menu.Button>
            <Menu.Items
              anchor="bottom end"
              className="z-[100] mt-2 w-44 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white py-1 shadow-card-hover focus:outline-none dark:border-white/10 dark:bg-surface-dark-elevated"
            >
              <Menu.Item>
                {({ active }) => (
                  <button type="button" onClick={onEdit} className={cn("flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold", active ? "bg-zinc-50 dark:bg-white/8" : "", "text-zinc-700 dark:text-zinc-200")}>
                    <FiEdit2 size={15} aria-hidden="true" /> Edit
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button type="button" onClick={onDuplicate} className={cn("flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold", active ? "bg-zinc-50 dark:bg-white/8" : "", "text-zinc-700 dark:text-zinc-200")}>
                    <FiCopy size={15} aria-hidden="true" /> Duplicate
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button type="button" onClick={onDelete} className={cn("flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold", active ? "bg-red-50 dark:bg-red-500/10" : "", "text-red-500")}>
                    <FiTrash2 size={15} aria-hidden="true" /> Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </motion.article>
  );
}
