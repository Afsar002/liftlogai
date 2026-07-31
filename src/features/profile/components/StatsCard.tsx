import {
  FiActivity,
  FiClock,
  FiLayers,
  FiTrendingUp,
  FiZap,
  FiBarChart2,
} from "react-icons/fi";

import Card from "../../../shared/components/ui/Card";
import ListRow from "../../../shared/components/ui/ListRow";

import type { ProfileStats } from "../types";
import SectionTitle from "../../../shared/components/ui/SectionTitle";


interface Props {
  stats: ProfileStats;
}

export default function StatsCard({ stats }: Props) {
  return (
    <Card>
      <SectionTitle
    title="Your Statistics"
    action={
        <FiBarChart2 size={20} />
    }
/>

      <div className="space-y-2">
        <ListRow
          icon={<FiLayers size={18} />}
          title="Workout Templates"
          value={stats.templateCount}
        />

        <ListRow
          icon={<FiActivity size={18} />}
          title="Exercises"
          value={stats.exerciseCount}
        />

        <ListRow
          icon={<FiTrendingUp size={18} />}
          title="Completed Workouts"
          value={stats.completedWorkouts}
        />

        <ListRow
          icon={<FiClock size={18} />}
          title="Training Hours"
          value={`${stats.trainingHours} hrs`}
        />

        <ListRow
          icon={<FiZap size={18} />}
          title="Current Streak"
          value={`${stats.streak} days`}
        />
      </div>
    </Card>
  );
}