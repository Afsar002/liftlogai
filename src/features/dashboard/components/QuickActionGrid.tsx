import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import { spring, press } from "../../../shared/components/motion/variants";
import {
  FiGrid,
  FiTarget,
  FiBarChart2,
  FiActivity,
} from "react-icons/fi";
import type { ComponentType } from "react";

interface QuickAction {
  title: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  href?: string;
  targetId?: string;
  color: string;
  gradient: string;
}

const actions: QuickAction[] = [
  {
    title: "Templates",
    icon: FiGrid,
    href: "/templates",
    color: "text-emerald-700",
    gradient: "from-emerald-600 to-lime-400",
  },
  {
    title: "Records",
    icon: FiTarget,
    href: "/records",
    color: "text-amber-700",
    gradient: "from-amber-600 to-orange-400",
  },
  {
    title: "Progress",
    icon: FiBarChart2,
    targetId: "weekly-progress",
    color: "text-blue-700",
    gradient: "from-blue-600 to-cyan-400",
  },
  {
    title: "Goals",
    icon: FiActivity,
    targetId: "goals",
    color: "text-purple-700",
    gradient: "from-purple-600 to-pink-400",
  },
  {
    title: "Exercises",
    icon: FiGrid,
    href: "/exercises",
    color: "text-indigo-700",
    gradient: "from-indigo-600 to-violet-400",
  },
];

/**
 * 2×2 (mobile) / 5-column (desktop) icon grid with haptic press feedback.
 * Each action has a distinct color identity for quick visual scanning.
 */
export default function QuickActionGrid() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  function handleClick(action: QuickAction) {
    if (action.targetId) {
      const target = document.getElementById(action.targetId);
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        return;
      }
    }
    if (action.href) {
      navigate(action.href);
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32, delay: 0.1 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <motion.button
            key={action.title}
            onClick={() => handleClick(action)}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            transition={press}
            className={cn(
              "group flex flex-col items-center gap-2.5 rounded-2xl p-4 text-center transition-all duration-200",
              "bg-zinc-50 hover:bg-zinc-100 hover:shadow-md dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.2)]"
            )}
            style={{ transitionDelay: `${reduceMotion ? 0 : index * 0.04}s` }}
          >
            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.12, rotate: 3 }}
              transition={spring}
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
            >
              <span
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-25 transition-opacity group-hover:opacity-35",
                  `bg-gradient-to-br ${action.gradient}`
                )}
              />
              <Icon
                size={24}
                className={cn("relative", action.color, "dark:opacity-90 transition-transform group-hover:scale-110")}
                aria-hidden="true"
              />
            </motion.div>
            <span className="text-sm font-bold text-zinc-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
              {action.title}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}