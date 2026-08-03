import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronRight, FiGrid, FiPlay } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { TemplateRepository } from "../../templates/services/TemplateRepository";
import type { WorkoutTemplateDB, TemplateExercise } from "../../../database/types";
import { cn } from "../../../shared/lib/cn";
import { spring } from "../../../shared/components/motion/variants";

interface TemplateCarouselProps {
  limit?: number;
}

/**
 * Horizontal scrolling carousel with 3-card peek.
 * Shows template preview with muscle focus, duration estimate, and quick start.
 */
export default function TemplateCarousel({ limit = 3 }: TemplateCarouselProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [templates, setTemplates] = useState<WorkoutTemplateDB[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const data = await TemplateRepository.getAll();
    setTemplates(data.slice(0, limit));
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  function getEstimatedDuration(exercises: TemplateExercise[]): number {
    // Estimate ~3 minutes per exercise + rest time
    const baseTime = exercises.length * 3;
    const restTime = exercises.reduce((sum, ex) => sum + ex.rest, 0) / 60;
    return Math.round(baseTime + restTime);
  }

  function getMuscleGroups(exercises: TemplateExercise[]) {
    // Simple heuristic - in real app would come from exercise data
    const groups = new Set<string>();
    exercises.forEach((ex) => {
      const lower = ex.name.toLowerCase();
      if (lower.includes("bench") || lower.includes("push") || lower.includes("chest")) groups.add("Chest");
      if (lower.includes("squat") || lower.includes("leg") || lower.includes("lunge")) groups.add("Legs");
      if (lower.includes("deadlift") || lower.includes("row") || lower.includes("pull")) groups.add("Back");
      if (lower.includes("shoulder") || lower.includes("press") || lower.includes("raise")) groups.add("Shoulders");
      if (lower.includes("curl") || lower.includes("tricep") || lower.includes("bicep")) groups.add("Arms");
      if (lower.includes("plank") || lower.includes("core") || lower.includes("abs")) groups.add("Core");
    });
    return Array.from(groups).slice(0, 3);
  }

  if (templates.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
              <FiGrid size={18} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Workout Templates
            </h2>
          </div>
        </div>

        <div className="mt-5">
          <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center dark:border-white/10">
            <p className="text-zinc-600 dark:text-zinc-400">No templates yet.</p>
            <button
              onClick={() => navigate("/templates")}
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create Template
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
            <FiGrid size={18} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Workout Templates
          </h2>
        </div>

        <button
          onClick={() => navigate("/templates")}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          See All
        </button>
      </div>

      <div className="mt-5">
        <motion.div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              role="button"
              tabIndex={0}
              aria-label={`View ${template.name}`}
              onClick={() => navigate(`/templates/${template.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/templates/${template.id}`);
                }
              }}
              className={cn(
                "relative flex-shrink-0 w-72 snap-start group",
                "rounded-2xl overflow-hidden bg-zinc-50 dark:bg-white/5",
                "cursor-pointer transition-all duration-300 hover:shadow-card-hover",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              )}
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
              style={{ transitionDelay: `${reduceMotion ? 0 : index * 0.06}s` }}
              initial={reduceMotion ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, delay: reduceMotion ? 0 : index * 0.06 + 0.1 }}
            >
              {/* Gradient accent bar at top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-lime-400" />

              <div className="p-4">
                <h3 className="truncate font-bold text-zinc-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {template.exercises.length} Exercises
                </p>

                <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <FiGrid size={12} aria-hidden="true" />
                    {template.exercises.length} exercises
                  </span>
                  <span className="flex items-center gap-1">
                    <FiChevronRight size={12} aria-hidden="true" />
                    {formatDuration(getEstimatedDuration(template.exercises))}
                  </span>
                </div>

                {/* Muscle focus tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {getMuscleGroups(template.exercises).map((muscle) => (
                    <span
                      key={muscle}
                      className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick start button overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/workout?template=${template.id}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                  <FiPlay size={16} aria-hidden="true" />
                  Start Workout
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <div className="flex justify-center gap-2 mt-3">
          {templates.map((_, index) => (
            <motion.div
              key={index}
              className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-white/10"
              animate={{ scale: index === 0 ? 1.5 : 1, backgroundColor: index === 0 ? "#10b981" : "rgba(113,113,122,0.4)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}