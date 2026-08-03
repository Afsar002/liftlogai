import Layout from "../../../shared/components/layout/Layout";

import TodayOverview from "../components/TodayOverview";
import NutritionSnapshot from "../components/NutritionSnapshot";
import WeeklyActivity from "../components/WeeklyActivity";
import RecoveryStreakWidget from "../components/RecoveryStreakWidget";
import QuickActionGrid from "../components/QuickActionGrid";
import TemplateCarousel from "../components/TemplateCarousel";
import { useDashboard } from "../hooks/useDashboard";
import Skeleton from "../../../shared/components/ui/Skeleton";

export default function Dashboard() {
  const { stats, loading } = useDashboard();

  if (loading || !stats) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton variant="card" className="h-56" />
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-48" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Skeleton variant="card" className="h-48" />
            <Skeleton variant="card" className="h-48" />
            <Skeleton variant="card" className="h-48" />
            <Skeleton variant="card" className="h-48" />
          </div>
          <Skeleton variant="card" className="h-56" />
          <Skeleton variant="card" className="h-72" />
          <Skeleton variant="card" className="h-56" />
          <Skeleton variant="card" className="h-56" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" id="dashboard">
        {/* Today Overview - Hero Section */}
        <section id="today">
          <TodayOverview
            lastWorkout={stats.lastWorkout}
            lastWorkoutDate={stats.lastWorkoutDate}
            workoutsThisWeek={stats.workoutsThisWeek}
            streak={stats.streak}
            totalVolume={stats.totalVolume}
            averageDuration={stats.averageDuration}
          />
        </section>

        {/* Quick Actions */}
        <section id="quick-actions">
          <QuickActionGrid />
        </section>

        {/* Nutrition Snapshot */}
        <section id="nutrition">
          <NutritionSnapshot />
        </section>

        {/* Weekly Activity - Replaces Progress Rings */}
        <section id="weekly-activity">
          <WeeklyActivity />
        </section>

        {/* Recovery & Streak Widget */}
        <section id="recovery">
          <RecoveryStreakWidget />
        </section>

        {/* Template Carousel */}
        <section id="templates">
          <TemplateCarousel limit={3} />
        </section>
      </div>
    </Layout>
  );
}
