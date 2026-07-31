import { NavLink, useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiHome,
  FiPlay,
  FiUser,
  FiHeart,
} from "react-icons/fi";

import { useWorkout } from "../../../features/workout/context/WorkoutContext";
import { cn } from "../../lib/cn";

const navItems = [
  {
    label: "Home",
    path: "/",
    icon: FiHome,
  },
  {
    label: "Workout",
    path: "/workout",
    icon: FiActivity,
  },
  {
    label: "Meals",
    path: "/meals",
    icon: FiHeart,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: FiBarChart2,
  },
  {
    label: "History",
    path: "/history",
    icon: FiClock,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: FiUser,
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { session } = useWorkout();

  function handleWorkoutClick() {
    navigate(session ? "/workout" : "/templates");
  }

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t",
        "border-zinc-200/80 dark:border-zinc-800/80",
        "bg-white/90 dark:bg-zinc-950/90",
        "backdrop-blur-xl supports-[backdrop-filter]:bg-white/80",
        "dark:supports-[backdrop-filter]:bg-zinc-950/80"
      )}
    >
      <div
        className="
          mx-auto
          flex
          max-w-lg
          items-center
          justify-around
          px-2
          py-2
          pb-[calc(env(safe-area-inset-bottom)+0.5rem)]
          
          sm:max-w-xl
          md:max-w-3xl
          lg:max-w-5xl
          xl:max-w-7xl
        "
      >
        {navItems.map((item) => {
          const Icon =
            item.label === "Workout" && session
              ? FiPlay
              : item.icon;

          if (item.label === "Workout") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={handleWorkoutClick}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  "text-zinc-500 hover:text-green-600 hover:bg-zinc-100",
                  "dark:text-zinc-400 dark:hover:text-green-400 dark:hover:bg-zinc-800/50"
                )}
              >
                <Icon size={20} />
                <span>
                  {session ? "Continue" : "Workout"}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50"
                )
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}