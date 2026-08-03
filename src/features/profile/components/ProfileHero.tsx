import { motion, useReducedMotion } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";
import type { UserSettings, FitnessGoal } from "../../settings/types";
import { calculateRequiredCalories } from "../../../shared/lib/calorieCalculator";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

const GOAL_LABELS: Record<FitnessGoal, string> = {
  maintain: "Maintain Weight",
  lose: "Lose Weight",
  gain: "Gain Weight",
};

const GOAL_EMOJI: Record<FitnessGoal, string> = {
  maintain: "⚖️",
  lose: "🔥",
  gain: "💪",
};

interface Props {
  settings: UserSettings | null;
  editing: boolean;
  onToggleEdit: () => void;
}

/**
 * Large gradient profile header — avatar, username, fitness goal and a daily
 * calorie ring. Replaces the plain "name card" at the top of Profile.
 */
export default function ProfileHero({
  settings,
  editing,
  onToggleEdit,
}: Props) {
  const reduceMotion = useReducedMotion();
  if (!settings) return null;

  const calc = calculateRequiredCalories(settings);
  const initial = (settings.username || "A").charAt(0).toUpperCase();
  const ring = 2 * Math.PI * 38;
  // Calorie ring: how much of TDEE the goal-required intake represents.
  const ratio = Math.min(calc.requiredCalories / (calc.tdee || 1), 1);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950 p-6 text-white shadow-[0_16px_50px_-16px_rgba(6,146,108,0.45)] dark:border-white/10"
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-emerald-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-lime-400/15 blur-3xl" />

      <div className="relative flex w-full flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex w-full min-w-0 flex-col items-center gap-4 sm:w-auto sm:flex-1 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="shrink-0">
            {settings.profilePicture ? (
              <img
                src={settings.profilePicture}
                alt="Profile"
                className="h-20 w-20 rounded-full border-2 border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-emerald-500 to-lime-400 text-3xl font-black text-emerald-950">
                {initial}
              </div>
            )}
          </div>

          <div className="min-w-0 max-w-full text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
              Athlete profile
            </p>
            <h1 className="truncate text-2xl font-black tracking-tight">{settings.username || "Athlete"}</h1>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-xs font-bold text-white/85">
              {GOAL_EMOJI[settings.goal]}
              {GOAL_LABELS[settings.goal]}
            </span>
          </div>
        </div>

        {/* Daily calorie ring */}
        <div className="flex shrink-0 flex-col items-center">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" strokeWidth="7" className="stroke-white/12" />
              <motion.circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={ring}
                initial={reduceMotion ? false : { strokeDashoffset: ring }}
                animate={{ strokeDashoffset: ring * (1 - ratio) }}
                transition={{ ...spring, delay: 0.2 }}
                className="stroke-lime-400"
              />
            </svg>
            <div className="absolute text-center leading-none">
              <span className="block text-2xl font-black tabular-nums text-white">
                {calc.requiredCalories}
              </span>
              <span className="block text-[8px] font-bold uppercase tracking-widest text-white/50">
                kcal/day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit trigger */}
      <button
        type="button"
        onClick={onToggleEdit}
        className={cn(
          "relative mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-sm font-bold transition-colors",
          editing
            ? "border-white/20 bg-white/12 text-white"
            : "border-white/12 bg-white/8 text-white/85 hover:bg-white/12"
        )}
      >
        <FiEdit3 size={15} aria-hidden="true" />
        {editing ? "Close editor" : "Edit profile"}
      </button>
    </motion.div>
  );
}
