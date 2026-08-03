import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiActivity, FiArrowLeft } from "react-icons/fi";

import Layout from "../../../shared/components/layout/Layout";
import Button from "../../../shared/components/ui/Button";
import Skeleton from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";

import { HistoryRepository } from "../repositories/HistoryRepository";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import WorkoutRecapHero from "../components/WorkoutRecapHero";
import SessionStack from "../components/SessionStack";

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<WorkoutHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const workoutId = parseInt(id, 10);
        const data = await HistoryRepository.getById(workoutId);
        if (!data) {
          setError("Workout not found");
          return;
        }
        setWorkout(data as WorkoutHistory);
      } catch (err) {
        console.error("Error loading workout:", err);
        setError("Failed to load workout");
      } finally {
        setLoading(false);
      }
    };
    loadWorkout();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-56" />
          <Skeleton variant="card" className="h-56" />
          <Skeleton variant="card" className="h-72" />
        </div>
      </Layout>
    );
  }

  if (error || !workout) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-32" />
          <EmptyState
            icon={<FiActivity size={28} />}
            title="Workout not found"
            description={error ?? "This session may have been deleted."}
            action={
              <Button variant="secondary" onClick={() => navigate("/history")}>
                Back to History
              </Button>
            }
          />
        </div>
      </Layout>
    );
  }

  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0
  );

  const dateLabel = new Date(workout.completedAt).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Layout>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/history")}
          aria-label="Back to history"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 dark:border-white/8 dark:text-zinc-400 dark:hover:bg-white/8"
        >
          <FiArrowLeft size={16} aria-hidden="true" />
        </button>

        <WorkoutRecapHero
          name={workout.templateName}
          dateLabel={dateLabel}
          stats={{
            exercises: workout.exercises.length,
            duration: workout.durationMinutes,
            sets: totalSets,
            volume: workout.totalVolume,
          }}
        />

        <div>
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Session breakdown</h3>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Tap to expand
            </span>
          </div>
          <SessionStack exercises={workout.exercises} />
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-lime-400/5 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Solid session — {totalSets} sets across {workout.exercises.length} exercises. Keep showing up.
          </p>
        </div>
      </div>
    </Layout>
  );
}
