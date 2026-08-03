import { useEffect, useMemo, useState } from "react";
import { FiActivity } from "react-icons/fi";
import toast from "react-hot-toast";

import Layout from "../../../shared/components/layout/Layout";
import Skeleton from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";

import { HistoryRepository } from "../repositories/HistoryRepository";
import type { WorkoutHistory } from "../models/WorkoutHistory";

import JourneyHero from "../components/JourneyHero";
import ActivityHeatmap from "../components/ActivityHeatmap";
import AchievementStrip from "../components/AchievementStrip";
import WorkoutTimeline from "../components/WorkoutTimeline";

import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { AnimatedPage } from "../../../shared/components/motion";

function computeStreaks(history: WorkoutHistory[]) {
  const daySet = new Set<string>();
  for (const workout of history) {
    daySet.add(new Date(workout.completedAt).toISOString().slice(0, 10));
  }
  const days = Array.from(daySet).sort();

  let current = 0;
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const day of days) {
    const date = new Date(day);
    if (prev && (date.getTime() - prev.getTime()) / 86400000 === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = date;
  }

  // Current streak: count consecutive days ending today or yesterday.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const anchor = daySet.has(today.toISOString().slice(0, 10))
    ? today
    : new Date(today.getTime() - 86400000);
  let cursor = new Date(anchor);
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    current += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }

  return { current, longest };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);

      const workouts = await HistoryRepository.getAll();
      setHistory(workouts);
    } catch (err) {
      console.error(err);
      setError("Failed to load workout history.");
      toast.error("Failed to load workout history.");
    } finally {
      setLoading(false);
    }
  }

  const lifetime = useMemo(() => {
    const totalMinutes = history.reduce((sum, w) => sum + w.durationMinutes, 0);
    const totalVolume = history.reduce((sum, w) => sum + w.totalVolume, 0);
    const { current, longest } = computeStreaks(history);
    return { totalMinutes, totalVolume, current, longest };
  }, [history]);

  const confirmDelete = () => {
    if (!selectedWorkoutId) return;
    deleteWorkout(selectedWorkoutId);
    setShowDeleteDialog(false);
    setSelectedWorkoutId(null);
  };

  async function deleteWorkout(id: number) {
    try {
      await HistoryRepository.delete(id);
      setHistory((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workout deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete workout.");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton variant="rectangular" className="h-40" />
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-40" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl">
          <Skeleton variant="rectangular" className="mb-6 h-40" />
          <EmptyState
            icon={<FiActivity size={28} />}
            title="Couldn't load history"
            description={error}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatedPage>
        <div className="mx-auto max-w-2xl space-y-7">
          {history.length === 0 ? (
            <EmptyState
              icon={<FiActivity size={28} />}
              title="No workouts yet"
              description="Complete your first workout and it will show up on your journey timeline."
            />
          ) : (
            <>
              <JourneyHero
                totalWorkouts={history.length}
                totalMinutes={lifetime.totalMinutes}
                totalVolume={lifetime.totalVolume}
                streak={lifetime.current}
                longestStreak={lifetime.longest}
              />

              <ActivityHeatmap history={history} />

              <AchievementStrip history={history} />

              <div>
                <div className="mb-3 flex items-baseline justify-between px-1">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Timeline</h3>
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {history.length} sessions
                  </span>
                </div>
                <WorkoutTimeline
                  history={history}
                  onDelete={(id) => {
                    setSelectedWorkoutId(id);
                    setShowDeleteDialog(true);
                  }}
                />
              </div>
            </>
          )}
        </div>

        <ConfirmDialog
          open={showDeleteDialog}
          title="Delete workout?"
          description="This workout will be permanently removed from your history."
          confirmText="Delete"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedWorkoutId(null);
          }}
        />
      </AnimatedPage>
    </Layout>
  );
}
