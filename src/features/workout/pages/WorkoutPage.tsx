import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

import { WorkoutRepository } from "../services/WorkoutRepository";
import type { WorkoutSessionDB } from "../../../database/types";

import Layout from "../../../shared/components/layout/Layout";
import { AnimatedList, AnimatedItem } from "../../../shared/components/motion";

import SessionHero from "../components/SessionHero";
import ExerciseProgressRail from "../components/ExerciseProgressRail";
import ExerciseLoggerCard from "../components/ExerciseLoggerCard";
import SessionDock from "../components/SessionDock";
import WorkoutReviewSheet from "../components/WorkoutReviewSheet";
import ExercisePickerSheet from "../components/ExercisePickerSheet";
import RestTimerOverlay from "../components/RestTimerOverlay";

import { useWorkout } from "../context/WorkoutContext";
import { useWorkoutStats } from "../hooks/useWorkoutStats";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";

import { useRestTimer } from "../context/RestTimerContext";

import { HistoryRepository } from "../../history/repositories/HistoryRepository";

import { detectPRs } from "../../records/services/PRDetector";
import type { PersonalRecord } from "../../records/types";

import { ExerciseService } from "../../exercises/services/ExerciseService";

import { db } from "../../../database/db";

/**
 * Scroll position saved when the user opens an in-workout exercise guide, so
 * returning to the session ("Continue Workout") restores where they were.
 * The active session itself lives in WorkoutProvider (above <Routes>) and is
 * persisted to localStorage, so only the scroll offset needs bridging here.
 */
const WORKOUT_SCROLL_KEY = "liftlog_workout_scroll";

function saveWorkoutScroll() {
  try {
    sessionStorage.setItem(WORKOUT_SCROLL_KEY, String(window.scrollY));
  } catch {
    // Storage unavailable — scroll won't be restored; the workout is unaffected.
  }
}

function restoreWorkoutScroll() {
  try {
    const saved = sessionStorage.getItem(WORKOUT_SCROLL_KEY);
    if (saved !== null) {
      sessionStorage.removeItem(WORKOUT_SCROLL_KEY);
      window.scrollTo(0, Number(saved) || 0);
    }
  } catch {
    // Storage unavailable — nothing to restore.
  }
}

export default function WorkoutPage() {
  const { session, resetWorkout, removeExercise, addExercise } = useWorkout();
  const navigate = useNavigate();
  const restTimer = useRestTimer();
  const [finished, setFinished] = useState(false);
  const [finalDuration, setFinalDuration] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startedAt = session?.startedAt
    ? typeof session.startedAt === "string"
      ? new Date(session.startedAt)
      : session.startedAt
    : new Date();

  const { formatted } = useWorkoutTimer(startedAt);
  const stats = useWorkoutStats(session, startedAt);
  const [newPRs, setNewPRs] = useState<PersonalRecord[]>([]);

  // Restore the scroll offset saved when the in-workout guide was opened, so
  // "Continue Workout" drops the user back where they left off.
  useEffect(() => {
    restoreWorkoutScroll();
  }, []);

  // Default the expanded exercise to the first one with incomplete sets.
  useEffect(() => {
    if (!session) return;
    const current = session.exercises.find((exercise) =>
      exercise.sets.some((set) => !set.completed)
    );
    setExpandedId(current?.id ?? session.exercises[0]?.id ?? null);
  }, []);

  const railExercises = useMemo(() => {
    if (!session) return [];
    return session.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      done:
        exercise.sets.length > 0 && exercise.sets.every((set) => set.completed),
      active: exercise.id === expandedId,
    }));
  }, [session, expandedId]);

  const completion = session && stats.totalSets > 0 ? stats.completedSets / stats.totalSets : 0;

  if (!session) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-12">
          <p className="text-zinc-500 dark:text-zinc-400">
            No active workout session.
          </p>
        </div>
      </Layout>
    );
  }

  if (finished) {
    return (
      <Layout>
        <div className="space-y-6">
          <WorkoutReviewSheet
            workoutName={session.workoutName}
            duration={finalDuration ?? formatted}
            exercises={session.exercises.length}
            sets={stats.completedSets}
            volume={stats.totalVolume}
            newPRs={newPRs}
            onSave={async () => {
              try {
                const finishedAt = new Date();

                const duration = Math.max(
                  1,
                  Math.round(
                    (finishedAt.getTime() - startedAt.getTime()) / 60000
                  )
                );

                const workout: WorkoutSessionDB = {
                  workoutName: session.workoutName,
                  startedAt: startedAt.toISOString(),
                  finishedAt: finishedAt.toISOString(),
                  duration,
                  exercises: session.exercises.map((exercise) => ({
                    exerciseId: exercise.exerciseId,
                    exerciseName: exercise.name,
                    sets: exercise.sets,
                  })),
                  totalSets: stats.totalSets,
                  completedSets: stats.completedSets,
                  totalVolume: stats.totalVolume,
                };

                const historyWorkout = {
                  templateId: 0,
                  templateName: session.workoutName,
                  startedAt: startedAt.toISOString(),
                  completedAt: finishedAt.toISOString(),
                  durationMinutes: duration,
                  totalVolume: stats.totalVolume,
                  exercises: session.exercises.map((exercise) => ({
                    exerciseId: exercise.id,
                    exerciseName: exercise.name,
                    sets: exercise.sets.map((set) => ({
                      reps: set.reps,
                      weight: set.weight,
                      completed: set.completed,
                    })),
                  })),
                };

                await db.transaction("rw", [db.workoutSessions, db.history], async () => {
                  await WorkoutRepository.saveWorkout(workout);
                  await HistoryRepository.save(historyWorkout);
                });

                toast.success("Workout Saved!");
                restTimer.reset();
                resetWorkout();
                setTimeout(() => {
                  navigate("/");
                }, 800);
              } catch (error) {
                console.error(error);
                toast.error("Failed to save workout");
              }
            }}
            onClose={() => {
              resetWorkout();
              navigate("/");
            }}
          />
        </div>
      </Layout>
    );
  }

  const endWorkout = async () => {
    const prs = await detectPRs(session.exercises);
    setNewPRs(prs);
    setFinalDuration(formatted);
    setFinished(true);
  };

  const jumpToExercise = (id: string) => {
    setExpandedId(id);
    document.getElementById(`exercise-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Layout>
      <div className="relative min-h-dvh">
        {/* Sticky session hero — gradient cockpit with live timer */}
        <SessionHero
          workoutName={session.workoutName}
          formatted={formatted}
          stats={{
            volume: stats.totalVolume,
            completedSets: stats.completedSets,
            totalSets: stats.totalSets,
            totalExercises: session.exercises.length,
          }}
          onFinish={endWorkout}
        />

        <div className="space-y-4 pt-5">
          {/* Exercise progress rail — chapter navigation for the session */}
          {session.exercises.length > 1 && (
            <ExerciseProgressRail exercises={railExercises} onSelect={jumpToExercise} />
          )}

          <AnimatedList className="space-y-3">
            {session.exercises.map((exercise, index) => (
              <AnimatedItem key={exercise.id}>
                <div id={`exercise-${exercise.id}`} className="scroll-mt-32">
                  <ExerciseLoggerCard
                    exercise={exercise}
                    index={index}
                    expanded={expandedId === exercise.id}
                    onToggle={() =>
                      setExpandedId((current) =>
                        current === exercise.id ? null : exercise.id
                      )
                    }
                    onRemove={() => removeExercise(exercise.id)}
                    onOpenGuide={() => {
                      saveWorkoutScroll();
                      navigate(`/exercises/${encodeURIComponent(exercise.exerciseId)}?from=workout`);
                    }}
                  />
                </div>
              </AnimatedItem>
            ))}
          </AnimatedList>

          {/* Inline add exercise (for desktop/long sessions) */}
          <motion.button
            type="button"
            onClick={() => setShowExercisePicker(true)}
            whileTap={{ scale: 0.99 }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 py-4 text-sm font-semibold text-zinc-500 transition-colors hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/5 dark:border-white/15 dark:text-zinc-400 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
          >
            <FiPlus size={18} aria-hidden="true" />
            Add Exercise
          </motion.button>
        </div>

        {/* Bottom session dock — all session actions in one bar */}
        <SessionDock
          completion={completion}
          onAddExercise={() => setShowExercisePicker(true)}
          onFinish={endWorkout}
        />

        <RestTimerOverlay />

        {/* Exercise Picker Sheet */}
        {showExercisePicker && (
          <ExercisePickerSheet
            onClose={() => setShowExercisePicker(false)}
            existingNames={session.exercises.map((e) => e.name)}
            onSelect={(exerciseId) => {
              ExerciseService.getExerciseById(exerciseId).then((exercise) => {
                if (exercise) {
                  addExercise({
                    id: crypto.randomUUID(),
                    name: exercise.name,
                    exerciseId: exerciseId,
                  });
                }
              });
            }}
          />
        )}
      </div>
    </Layout>
  );
}
