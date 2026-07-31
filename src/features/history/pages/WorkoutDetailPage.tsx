import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiActivity, FiClock, FiLayers, FiTarget } from "react-icons/fi";

import Layout from "../../../shared/components/layout/Layout";
import Card from "../../../shared/components/ui/Card";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Button from "../../../shared/components/ui/Button";
import Skeleton from "../../../shared/components/ui/Skeleton";

import { HistoryRepository } from "../repositories/HistoryRepository";
import type { WorkoutHistory } from "../models/WorkoutHistory";
import { formatWorkoutTime } from "../utils/formatWorkoutTime";

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
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" className="h-10 w-10" />
            <Skeleton variant="text" className="h-8 w-48" />
          </div>
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </Layout>
    );
  }

  if (error || !workout) {
    return (
      <Layout>
        <div className="space-y-6">
          <PageHeader title="Workout Details" />
          <Card>
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-red-500 dark:text-red-400 mb-4">{error || "Workout not found"}</p>
              <Button variant="secondary" onClick={() => navigate("/profile")}>
                Back to Profile
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <PageHeader title="Workout Details" />
        </div>

        {/* Workout Header */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                <FiActivity size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {workout.templateName}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatWorkoutTime(workout.completedAt)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={<FiTarget />} label="Exercises" value={String(workout.exercises.length)} />
              <Stat icon={<FiClock />} label="Duration" value={`${workout.durationMinutes} min`} />
              <Stat icon={<FiLayers />} label="Sets" value={String(totalSets)} />
              <Stat icon={<FiActivity />} label="Volume" value={`${workout.totalVolume.toLocaleString()} kg`} />
            </div>
          </div>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Exercises
          </h3>
          {workout.exercises.map((exercise, index) => (
            <Card key={index}>
              <div className="space-y-3">
                <h4 className="font-semibold text-zinc-900 dark:text-white">
                  {exercise.exerciseName}
                </h4>
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                    >
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Set {setIndex + 1}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {set.weight} kg
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {set.reps} reps
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
      <div className="flex items-center justify-between">
        <span className="text-green-500">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}