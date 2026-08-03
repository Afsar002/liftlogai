import Layout from "../../../shared/components/layout/Layout";

import GreetingCard from "../components/GreetingCard";
import WorkoutCard from "../components/WorkoutCard";
import StatCard from "../components/StatCard";
import GoalCard from "../components/GoalCard";
import QuickActions from "../components/DashboardQuickActions";
import WeeklyProgress from "../components/WeeklyProgress";
import DashboardTemplates from "../components/DashboardTemplates";
import { useDashboard } from "../hooks/useDashboard";
import DashboardRecentWorkouts from "../components/DashboardRecentWorkouts";
import NutritionCard from "../../meals/components/NutritionCard";

import {
  FiTrendingUp,
  FiActivity,
  FiZap,
  FiDroplet,
} from "react-icons/fi";
import { useSettings } from "../../settings/hooks/SettingsProvider";
import Skeleton from "../../../shared/components/ui/Skeleton";

export default function Dashboard() {
  const { stats, loading } = useDashboard();
  const { settings } = useSettings();

  if (loading || !stats) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton variant="text" className="h-6 w-48" />
          <Skeleton variant="text" className="h-8 w-64" />
          <Skeleton variant="card" className="h-32" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <GreetingCard name={settings?.username || "User"} />

        <WorkoutCard
          workout={stats.lastWorkout ?? "No Workout"}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Workout Streak"
            value={`${stats.streak} Day`}
            icon={<FiTrendingUp size={20} />}
          />

          <StatCard
            title="Avg Duration"
            value={`${stats.averageDuration} min`}
            icon={<FiActivity size={20} />}
          />

          <StatCard
            title="Total Volume"
            value={`${stats.totalVolume.toLocaleString()} kg`}
            icon={<FiZap size={20} />}
          />

          <StatCard
            title="This Week"
            value={`${stats.workoutsThisWeek}`}
            icon={<FiDroplet size={20} />}
          />
        </div>

        <NutritionCard />

        <DashboardTemplates />
        
        <DashboardRecentWorkouts />

        <div id="goals">
          <GoalCard />
        </div>

        <QuickActions />
      </div>
    </Layout>
  );
}