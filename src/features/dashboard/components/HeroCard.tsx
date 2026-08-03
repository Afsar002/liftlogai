import { useSettings } from "../../settings/hooks/SettingsProvider";
import { useWorkout } from "../../workout/context/WorkoutContext";
import { useNavigate } from "react-router-dom";
import { FiActivity, FiPlay } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

/**
 * Hevy-style hero card with gradient mesh, time-aware greeting,
 * streak progress ring, and primary CTA.
 * The only full emerald→lime gradient band on the dashboard.
 */
export default function HeroCard() {
  const { settings } = useSettings();
  const { session: currentSession, setSession } = useWorkout();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const name = settings?.username || "User";
  const avatar = settings?.profilePicture;
  // Use a default streak value since it's not in settings
  const streak: number = 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleWorkoutClick() {
    if (currentSession) {
      const confirmStart = window.confirm(
        "An active workout session is already in progress. Start a new workout and discard the current session?"
      );
      if (!confirmStart) return;
    }

    const { TemplateRepository } = await import(
      "../../templates/services/TemplateRepository"
    );
    const { WorkoutSessionFactory } = await import(
      "../../workout/services/WorkoutSessionFactory"
    );
    const toast = (await import("react-hot-toast")).default;

    const templates = await TemplateRepository.getAll();

    if (templates.length === 0) {
      toast.error("No workout templates found.");
      navigate("/templates");
      return;
    }

    const template = templates[0];
    const session = await WorkoutSessionFactory.create(template);
    setSession(session);
    toast.success(`${template.name} started`);
    navigate("/workout");
  }

  const streakProgress = Math.min(streak / 7, 1);

  // Only show streak ring if streak > 0
  const showStreak = streak > 0;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-400 p-6 sm:p-8"
    >
      {/* Gradient mesh atmosphere - richer, deeper */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <span className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-emerald-950/20 blur-3xl" />
        <span className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-lime-300/30 blur-3xl" />
        <span className="absolute bottom-1/4 left-1/3 h-40 w-40 rounded-full bg-emerald-700/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        {/* Greeting & streak */}
        <div className="min-w-0 sm:flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-950/80">
            {greeting} 👋
          </p>
          <h1 className="mt-1 truncate text-4xl font-extrabold tracking-tight text-emerald-950 sm:text-5xl">
            {name}
          </h1>
          <p className="mt-2 text-sm font-medium text-emerald-950/90">
            {dateStr}
          </p>

          {/* Streak progress ring - only show if streak > 0 */}
          {showStreak && (
            <div className="mt-6 flex items-center gap-4">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 30 }}
                className="relative flex h-14 w-14 shrink-0 items-center justify-center"
              >
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-emerald-950/30"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#streakGradient)"
                    strokeWidth="8"
                    strokeDasharray={283}
                    strokeDashoffset={283 * (1 - streakProgress)}
                    strokeLinecap="round"
                    className="text-emerald-950"
                    initial={reduceMotion ? false : { strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 * (1 - streakProgress) }}
                    transition={{ type: "spring", stiffness: 280, damping: 25, duration: 1 }}
                  />
                  <defs>
                    <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea875" />
                      <stop offset="100%" stopColor="#a3e635" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-emerald-950">
                  {streak}
                </span>
              </motion.div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-950/80">
                  Current Streak
                </p>
                <p className="text-sm font-medium text-emerald-950">
                  {streak === 1 ? "1 day" : `${streak} days`} in a row
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Avatar & primary CTA */}
        <div className="flex flex-col items-end gap-4 sm:items-end">
          {avatar ? (
            <motion.img
              initial={reduceMotion ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 30 }}
              src={avatar}
              alt="Profile"
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-white/30"
            />
          ) : (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 30 }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-950/15 text-xl font-bold text-emerald-950 ring-4 ring-white/30"
            >
              {initials}
            </motion.div>
          )}

          <motion.button
            onClick={handleWorkoutClick}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={spring}
            className={cn(
              "relative flex items-center gap-3 rounded-full bg-emerald-950 px-6 py-3.5 text-base font-bold text-lime-300",
              "shadow-[0_8px_32px_rgba(14,168,117,0.45)]",
              "focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
            )}
            aria-label={currentSession ? "Continue workout" : "Start workout"}
          >
            {currentSession && !reduceMotion && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-emerald-950/40"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            {currentSession ? <FiActivity size={22} /> : <FiPlay size={22} />}
            <span>{currentSession ? "Continue Workout" : "Start Workout"}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}