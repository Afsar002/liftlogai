import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiX } from "react-icons/fi";

import { WorkoutRepository } from "../services/WorkoutRepository";
import { WorkoutSessionFactory } from "../services/WorkoutSessionFactory";
import type { WorkoutSessionDB } from "../../../database/types";

import Layout from "../../../shared/components/layout/Layout";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";

import WorkoutHeader from "../components/WorkoutHeader";
import ExerciseHeader from "../components/ExerciseHeader";
import PreviousPerformance from "../components/PreviousPerformance";
import SetTable from "../components/SetTable";
import AddSetButton from "../components/AddSetButton";
import FinishWorkoutButton from "../components/FinishWorkoutButton";
import WorkoutSummary from "../components/WorkoutSummary";
import ExercisePickerModal from "../../exercises/components/ExercisePickerModal";

import { useWorkout } from "../context/WorkoutContext";
import { useWorkoutStats } from "../hooks/useWorkoutStats";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";

import RestTimer from "../components/RestTimer";
import { useRestTimer } from "../context/RestTimerContext";

import { HistoryRepository } from "../../history/repositories/HistoryRepository";

import { detectPRs } from "../../records/services/PRDetector";
import type { PersonalRecord } from "../../records/types";

import { db } from "../../../database/db";

export default function WorkoutPage() {
  const { session, setSession, resetWorkout, removeExercise, addExercise } = useWorkout();
  const navigate = useNavigate();
  const restTimer = useRestTimer();
  const [finished, setFinished] = useState(false);
  const [finalDuration, setFinalDuration] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const startedAt = session?.startedAt
    ? typeof session.startedAt === "string"
      ? new Date(session.startedAt)
      : session.startedAt
    : new Date();

  const { formatted } = useWorkoutTimer(startedAt);
  const stats = useWorkoutStats(session);
  const [newPRs, setNewPRs] = useState<PersonalRecord[]>([]);

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
        <div className="mx-auto max-w-2xl space-y-6">
          <WorkoutSummary
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
                  exercises: session.exercises
                    .filter((exercise) => exercise.sets.some((set) => set.completed))
                    .map((exercise) => ({
                      exerciseId: exercise.id,
                      exerciseName: exercise.name,
                      sets: exercise.sets
                        .filter((set) => set.completed)
                        .map((set) => ({
                          reps: set.reps,
                          weight: set.weight,
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
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <WorkoutHeader
          title={session.workoutName}
          duration={formatted}
        />

        {session.exercises.map((exercise) => (
          <Card key={exercise.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Link
                  to={`/exercise/${encodeURIComponent(exercise.name)}`}
                  className="hover:opacity-80 transition-opacity"
                >
                  <ExerciseHeader name={exercise.name} />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<FiTrash2 size={16} />}
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-500/10"
                  aria-label="Remove exercise"
                />
              </div>

              <PreviousPerformance
                value={exercise.previous ?? "-"}
              />

              <SetTable
                exerciseId={exercise.id}
                sets={exercise.sets}
              />

              <AddSetButton exerciseId={exercise.id} />
            </div>
          </Card>
        ))}

        {/* Add Exercise Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full py-4 border-dashed"
          icon={<FiPlus size={20} />}
          onClick={() => setShowExercisePicker(true)}
        >
          Add Exercise
        </Button>

        {/* Exercise Picker Modal */}
        <ExercisePickerModal
          open={showExercisePicker}
          onClose={() => setShowExercisePicker(false)}
          existingNames={session.exercises.map(e => e.name)}
          onSelect={(exerciseId) => {
            import("../../exercises/services/ExerciseLibraryRepository").then(async ({ ExerciseLibraryRepository }) => {
              const exercise = await ExerciseLibraryRepository.getById(exerciseId);
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

        {restTimer.secondsLeft > 0 && (
          <RestTimer
            formatted={restTimer.formatted}
            running={restTimer.running}
            secondsLeft={restTimer.secondsLeft}
            onPause={restTimer.pause}
            onResume={restTimer.resume}
            onReset={restTimer.reset}
            onSkip={restTimer.skip}
          />
        )}

        <FinishWorkoutButton
          onClick={async () => {
            const prs = await detectPRs(session.exercises);
            setNewPRs(prs);
            setFinalDuration(formatted);
            setFinished(true);
          }}
        />
      </div>
    </Layout>
  );
}