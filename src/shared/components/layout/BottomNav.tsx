import { useRef, useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiHeart,
  FiHome,
  FiPlay,
  FiUser,
} from "react-icons/fi";

import { useWorkout } from "../../../features/workout/context/WorkoutContext";
import { cn } from "../../lib/cn";
import { press, spring } from "../motion/variants";

const navItems = [
  { label: "Home", path: "/", icon: FiHome },
  { label: "Meals", path: "/meals", icon: FiHeart },
  { label: "History", path: "/history", icon: FiClock },
  { label: "Analytics", path: "/analytics", icon: FiBarChart2 },
  { label: "Profile", path: "/profile", icon: FiUser },
];

/**
 * Floating pill bottom navigation with a raised emerald→lime Start/Continue
 * action at center. Hides on scroll down, reveals on scroll up.
 * Dynamic island styling with haptic feedback on primary action.
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useWorkout();
  const reduceMotion = useReducedMotion();

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { scrollY } = useScroll();

  // Haptic feedback on primary action
  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  useMotionValueEvent(scrollY, "change", (y) => {
    const diff = y - lastY.current;
    if (y > 140 && diff > 0) {
      setHidden(true);
    } else if (diff < -6 || y < 140) {
      setHidden(false);
    }
    lastY.current = y;
  });

  // Also hide on route change for non-home routes
  useEffect(() => {
    if (location.pathname !== "/") {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [location.pathname]);

  function handleWorkoutClick() {
    triggerHaptic();
    navigate(session ? "/workout" : "/templates");
  }

  return (
    <motion.nav
      aria-label="Primary"
      initial={false}
      animate={hidden ? { y: 160, opacity: 0 } : { y: 0, opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 38 }}
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 sm:px-6"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className={cn(
          "pointer-events-auto relative flex h-[80px] items-end rounded-full px-2 pb-2.5 sm:px-3",
          "border border-white/10 bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl",
          "supports-[backdrop-filter]:bg-white/75 dark:border-white/5 dark:bg-[#141417]/80 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
          "w-full max-w-md"
        )}
      >
        {/* Left items */}
        {navItems.slice(0, 2).map((item) => (
          <NavItem key={item.path} {...item} isActive={location.pathname === item.path} />
        ))}

        {/* Center Start/Continue action */}
        <div className="relative flex h-full w-16 shrink-0 items-end justify-center">
          <motion.button
            type="button"
            onClick={handleWorkoutClick}
            aria-label={session ? "Continue workout" : "Start workout"}
            title={session ? "Continue workout" : "Start workout"}
            whileTap={reduceMotion ? undefined : { scale: 0.88 }}
            transition={press}
            className={cn(
              "absolute -top-8 flex h-18 w-18 items-center justify-center rounded-full",
              "bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950",
              "shadow-[0_8px_32px_rgba(16,185,129,0.35)] focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B0B0D]"
            )}
          >
            {session && !reduceMotion && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-emerald-500/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            {session ? <FiActivity size={26} /> : <FiPlay size={26} />}
          </motion.button>
        </div>

        {/* Right items */}
        {navItems.slice(2).map((item) => (
          <NavItem key={item.path} {...item} isActive={location.pathname === item.path} />
        ))}
      </div>
    </motion.nav>
  );
}

function NavItem({
  label,
  path,
  icon: Icon,
  isActive,
}: {
  label: string;
  path: string;
  icon: typeof FiHome;
  isActive: boolean;
}) {
  return (
    <NavLink
      to={path}
      className={({ isActive: active }) =>
        cn(
          "relative flex w-full flex-col items-center justify-center gap-0.5 rounded-full py-1 text-[11px] font-semibold transition-colors",
          active
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
        )
      }
    >
      {({ isActive: active }) => (
        <>
          <Icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
          <span className="whitespace-nowrap">{label}</span>
          {active && (
            <motion.span
              layoutId="nav-active-dot"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}
