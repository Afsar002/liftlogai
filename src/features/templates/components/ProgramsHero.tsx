import { motion, useReducedMotion } from "framer-motion";
import { FiLayers, FiPlus } from "react-icons/fi";

interface Props {
  programCount: number;
  exerciseCount: number;
  onCreate: () => void;
}

/**
 * Programs hero — full-width gradient banner with the program count and a
 * floating gradient "New program" action. Replaces the old page header row.
 */
export default function ProgramsHero({ programCount, exerciseCount, onCreate }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-6 shadow-sm"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
              Library
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
              Workout Programs
            </h1>
            <p className="mt-1 text-xs font-semibold text-white/60">
              Saved routines, ready to run in one tap.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={onCreate}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-3.5 py-2.5 text-xs font-extrabold text-emerald-950 shadow-fab"
          >
            <FiPlus size={14} aria-hidden="true" />
            New program
          </motion.button>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
            <FiLayers size={11} aria-hidden="true" />
            {programCount} program{programCount === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80">
            {exerciseCount} total exercises
          </span>
        </div>
      </div>
    </motion.section>
  );
}
