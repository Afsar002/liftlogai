import { motion, useReducedMotion } from "framer-motion";
import { FiClock, FiPlay, FiRepeat } from "react-icons/fi";
import type { WorkoutTemplateDB } from "../../../database/types";
import { cn } from "../../../shared/lib/cn";
import { estimateDuration, difficultyFor, type Difficulty } from "../lib/templateMeta";

interface Props {
  templates: WorkoutTemplateDB[];
  onStart: (template: WorkoutTemplateDB) => void;
  onOpen: (template: WorkoutTemplateDB) => void;
}

const COVER_GRADIENTS = [
  "from-emerald-500/40 via-teal-500/20 to-transparent",
  "from-violet-500/40 via-fuchsia-500/20 to-transparent",
  "from-orange-500/40 via-amber-500/20 to-transparent",
  "from-sky-500/40 via-cyan-500/20 to-transparent",
  "from-rose-500/40 via-pink-500/20 to-transparent",
];

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
  Intermediate: "bg-amber-400/20 text-amber-300 border-amber-400/40",
  Advanced: "bg-red-400/20 text-red-300 border-red-400/40",
};

/**
 * Featured programs — horizontal snap-scroll rail of wide landscape cover
 * cards. Cards are compact: gradient artwork, name, difficulty, duration and
 * a circular Play button, with the whole card tappable to open the editor.
 */
export default function FeaturedPrograms({ templates, onStart, onOpen }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {templates.map((template, index) => {
        const duration = estimateDuration(template.exercises);
        const difficulty = difficultyFor(template.exercises);

        return (
          <motion.div
            key={template.id}
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 340, damping: 28 }}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(template)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(template);
            }}
            className="relative h-40 w-72 shrink-0 snap-start cursor-pointer overflow-hidden rounded-3xl bg-zinc-950 text-left shadow-sm"
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", COVER_GRADIENTS[index % COVER_GRADIENTS.length])} />
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex h-full flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide", DIFFICULTY_STYLES[difficulty])}>
                  {difficulty}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-white/60">
                  <FiRepeat size={10} aria-hidden="true" /> {template.exercises.length} ex.
                </span>
              </div>

              <div>
                <h3 className="truncate text-lg font-black tracking-tight text-white">
                  {template.name}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-white/70">
                  <span className="flex items-center gap-1">
                    <FiClock size={10} aria-hidden="true" /> {duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Play button */}
            <button
              type="button"
              aria-label={`Start ${template.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onStart(template);
              }}
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 text-emerald-950 shadow-fab transition-transform active:scale-90"
            >
              <FiPlay size={16} className="translate-x-[1px]" aria-hidden="true" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
