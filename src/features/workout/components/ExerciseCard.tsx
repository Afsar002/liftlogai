import { motion, useReducedMotion } from "framer-motion";
import { FiTarget, FiInfo, FiAward } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface Props {
  name: string;
  exerciseId: string;
  previousBest?: string;
  primaryMuscle?: string;
  secondaryMuscles?: string[];
  onCardClick?: () => void;
  onGuideClick: () => void;
}

const muscleColors = {
  chest: "bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  back: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  legs: "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  shoulders: "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
  arms: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  core: "bg-pink-500/15 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
  cardio: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  default: "bg-zinc-500/15 text-zinc-600 dark:bg-white/10 dark:text-zinc-400",
};

function getMuscleColor(muscle: string) {
  const key = muscle.toLowerCase() as keyof typeof muscleColors;
  return muscleColors[key] || muscleColors.default;
}

export default function ExerciseCard({
  name,
  exerciseId,
  previousBest,
  primaryMuscle,
  secondaryMuscles = [],
  onCardClick,
  onGuideClick,
}: Props) {
  const reduceMotion = useReducedMotion();
  const interactive = onCardClick != null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open details for ${name}` : undefined}
      onClick={interactive ? onCardClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "space-y-3",
        interactive && "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-xl"
      )}
    >
      {/* Exercise Name + Muscle Badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white truncate">
            {name}
          </h2>

          {primaryMuscle && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 380, damping: 32 }}
              className="mt-2 flex items-center gap-2 flex-wrap"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em]",
                  getMuscleColor(primaryMuscle)
                )}
              >
                <FiTarget size={10} aria-hidden="true" />
                {primaryMuscle}
              </span>

              {secondaryMuscles.slice(0, 2).map((muscle, idx) => (
                <motion.span
                  key={muscle}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + idx * 0.05, type: "spring", stiffness: 380, damping: 32 }}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5"
                >
                  {muscle}
                </motion.span>
              ))}

              {secondaryMuscles.length > 2 && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5">
                  +{secondaryMuscles.length - 2} more
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Previous Best + Guide Button */}
        <div className="flex shrink-0 items-center gap-2">
          {previousBest && previousBest !== "-" && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 380, damping: 32 }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
            >
              <FiAward size={12} aria-hidden="true" />
              <span>Best: {previousBest}</span>
            </motion.div>
          )}

          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onGuideClick();
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/8 dark:text-zinc-500 dark:hover:text-zinc-300"
            aria-label={`View guide for ${name}`}
          >
            <FiInfo size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}