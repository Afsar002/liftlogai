import { motion } from "framer-motion";
import { FiPlay, FiPlayCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useWorkout } from "../../workout/context/WorkoutContext";
import { WorkoutSessionFactory } from "../../workout/services/WorkoutSessionFactory";
import { TemplateRepository } from "../../templates/services/TemplateRepository";
import { spring } from "../../../shared/components/motion/variants";

interface WorkoutCardProps {
  workout: string;
}

/**
 * Signature gradient hero. The only full emerald→lime band on the dashboard —
 * everything else stays neutral so this reads as the primary moment.
 */
export default function WorkoutCard({
  workout,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const { session: currentSession, setSession } = useWorkout();

  async function startWorkout() {
    if (currentSession) {
      const confirmStart = window.confirm(
        "An active workout session is already in progress. Start a new workout and discard the current session?"
      );
      if (!confirmStart) return;
    }

    const templates = await TemplateRepository.getAll();

    if (templates.length === 0) {
      toast.error("No workout templates found.");
      navigate("/templates");
      return;
    }

    const template = templates[0];

    const session =
      await WorkoutSessionFactory.create(template);

    setSession(session);

    toast.success(`${template.name} started`);

    navigate("/workout");
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="Start workout"
      onClick={startWorkout}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startWorkout();
        }
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={spring}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 p-6 shadow-card-hover sm:p-8"
    >
      {/* Decorative atmosphere */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -left-8 h-44 w-44 rounded-full bg-emerald-950/10 blur-2xl"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-950/70">
            Today's Workout
          </p>
          <h2 className="mt-2 truncate text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
            {workout}
          </h2>
          <p className="mt-1.5 text-sm font-medium text-emerald-950/70">
            Tap to start your session
          </p>
        </div>

        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-950/10 text-emerald-950">
          <FiPlayCircle size={30} aria-hidden="true" />
        </span>
      </div>

      <div className="relative mt-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-transform duration-200 group-hover:scale-105">
          <FiPlay size={16} aria-hidden="true" />
          Start Workout
        </span>
      </div>
    </motion.div>
  );
}
