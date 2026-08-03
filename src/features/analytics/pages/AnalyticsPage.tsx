import { useEffect, useState } from "react";

import Layout from "../../../shared/components/layout/Layout";
import Skeleton from "../../../shared/components/ui/Skeleton";

import { useAnalytics } from "../hooks/useAnalytics";
import { useStrengthProgress } from "../hooks/useStrengthProgress";
import { AnalyticsService } from "../services/AnalyticsService";
import { useWorkoutHeatmap } from "../hooks/useWorkoutHeatmap";
import { useMonthlyTrends } from "../hooks/useMonthlyTrends";

import InsightHero from "../components/InsightHero";
import MilestoneStrip from "../components/MilestoneStrip";
import WeeklyRhythm from "../components/WeeklyRhythm";
import MuscleBalance from "../components/MuscleBalance";
import ExercisePills from "../components/ExercisePills";
import StrengthProgress from "../components/StrengthProgress";
import WorkoutHeatmap from "../components/WorkoutHeatmap";
import MonthlyTrends from "../components/MonthlyTrends";

export default function AnalyticsPage() {
  const { summary, weeklyVolume } = useAnalytics();
  const [selectedExercise, setSelectedExercise] = useState("");
  const strengthProgress = useStrengthProgress(selectedExercise);
  const [exercises, setExercises] = useState<{ id: string; name: string }[]>([]);
  const [distribution, setDistribution] = useState<{ name: string; value: number }[]>([]);
  const heatmap = useWorkoutHeatmap();
  const monthlyTrends = useMonthlyTrends();

  useEffect(() => {
    async function loadExercises() {
      const data = await AnalyticsService.getExercises();
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
      const sorted = d.sort((a, b) => b.value - a.value).slice(0, 8);
      setDistribution(sorted);
    }
    loadDistribution();
  }, []);

  if (!summary) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-48" />
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-32" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton variant="card" className="h-64" />
            <Skeleton variant="card" className="h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  const weeklyScore =
    weeklyVolume.length > 0
      ? weeklyVolume.filter((d) => d.volume > 0).length / 7
      : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <InsightHero
          workouts={summary.totalWorkouts}
          volume={summary.totalVolume}
          streak={summary.currentStreak}
          prs={summary.totalPRs}
          favorite={summary.favoriteExercise}
          weeklyScore={weeklyScore}
        />

        <MilestoneStrip
          workouts={summary.totalWorkouts}
          volume={summary.totalVolume}
          minutes={summary.totalDuration}
          prs={summary.totalPRs}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeeklyRhythm data={weeklyVolume} />
          <MuscleBalance data={distribution} />
        </div>

        <div className="space-y-4">
          {exercises.length > 0 && (
            <ExercisePills
              exercises={exercises}
              selectedId={selectedExercise}
              onSelect={setSelectedExercise}
            />
          )}
          <StrengthProgress data={strengthProgress} />
        </div>

        <WorkoutHeatmap data={heatmap} />

        <MonthlyTrends data={monthlyTrends} />
      </div>
    </Layout>
  );
}
