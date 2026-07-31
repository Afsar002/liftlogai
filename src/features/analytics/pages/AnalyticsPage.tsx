import Layout from "../../../shared/components/layout/Layout";

import { useAnalytics } from "../hooks/useAnalytics";
import MetricCard from "../components/MetricCard";
import WeeklyVolumeChart from "../components/WeeklyVolumeChart";
import AreaTrends from "../components/AreaTrends";
import DonutChart from "../components/DonutChart";
import { useState } from "react";

import { useStrengthProgress } from "../hooks/useStrengthProgress";
import StrengthProgress from "../components/StrengthProgress";

import { useEffect} from "react";
import { AnalyticsService } from "../services/AnalyticsService";

import WorkoutHeatmap from "../components/WorkoutHeatmap";
import { useWorkoutHeatmap} from "../hooks/useWorkoutHeatmap";

import MonthlyTrends from "../components/MonthlyTrends";
import { useMonthlyTrends } from "../hooks/useMonthlyTrends";
import Card from "../../../shared/components/ui/Card";
import Skeleton from "../../../shared/components/ui/Skeleton";

export default function AnalyticsPage() {
  const { summary, weeklyVolume } = useAnalytics();
  const   [selectedExercise, setSelectedExercise] = useState("");
  const strengthProgress =useStrengthProgress(selectedExercise)  
  const [exercises, setExercises] = useState<  { id: string; name: string }[]>([]);
  const [distribution, setDistribution] = useState<{name:string;value:number}[]>([]);
  const heatmap = useWorkoutHeatmap();
  const monthlyTrends = useMonthlyTrends();

useEffect(() => {
  async function loadExercises() {
    const data =
      await AnalyticsService.getExercises();

    setExercises(data);

    if (data.length > 0) {
      setSelectedExercise(data[0].id);
    }
  }

  loadExercises();
}, []);

useEffect(() => {
  async function loadDistribution() {
    const d = await AnalyticsService.getExerciseDistribution();

    const sorted = d.sort((a,b) => b.value - a.value).slice(0, 8);

    setDistribution(sorted);
  }

  loadDistribution();
}, []);

if (!summary) {
    return (
      <Layout>
        <div className="space-y-6 p-4">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="text" className="h-4 w-64" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Track your training progress and performance insights
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            title="Total Workouts"
            value={summary.totalWorkouts}
            icon="workouts"
          />

          <MetricCard
            title="Total Volume"
            value={summary.totalVolume}
            suffix=" kg"
            icon="volume"
          />

          <MetricCard
            title="Total Sets"
            value={summary.totalSets}
            icon="sets"
          />

          <MetricCard
            title="Training Time"
            value={summary.totalDuration}
            suffix=" min"
            icon="time"
          />

          <MetricCard
            title="Average Workout"
            value={summary.averageWorkoutDuration}
            suffix=" min"
            icon="average"
          />

          <MetricCard
            title="Current Streak"
            value={summary.currentStreak}
            suffix=" days"
            icon="streak"
          />

          <MetricCard
            title="Personal Records"
            value={summary.totalPRs}
            icon="prs"
          />

          <MetricCard
            title="Favorite Exercise"
            value={summary.favoriteExercise}
            icon="favorite"
          />
        </div>

        {/* Weekly Volume Chart + Area */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeeklyVolumeChart data={weeklyVolume} />
          <AreaTrends data={weeklyVolume} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DonutChart data={distribution} />

          <div className="space-y-4">
            <Card>
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Select Exercise
                </label>
                <div className="relative">
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:border-zinc-600"
                  >
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </Card>

            <StrengthProgress data={strengthProgress} />
          </div>
        </div>

        <WorkoutHeatmap data={heatmap} />

        <MonthlyTrends data={monthlyTrends} />
    </div>
    </Layout>
  );
}