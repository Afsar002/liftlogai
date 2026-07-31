import Layout from "../../../shared/components/layout/Layout";

import AboutCard from "../components/AboutCard";
import DataCard from "../components/DataCard";
import SettingsCard from "../components/SettingsCard";
import StatsCard from "../components/StatsCard";
import UserProfileCard from "../components/UserProfileCard";

import { useProfile } from "../hooks/useProfile";

export default function ProfilePage() {
  const { stats } = useProfile();

  return (
    <Layout>
      <div className="space-y-6">
        <UserProfileCard />

        <StatsCard stats={stats} />

        <SettingsCard />

        <DataCard />

        <AboutCard />
      </div>
    </Layout>
  );
}