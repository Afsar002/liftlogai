import { useState } from "react";
import Layout from "../../../shared/components/layout/Layout";
import Skeleton from "../../../shared/components/ui/Skeleton";
import { AnimatedPage } from "../../../shared/components/motion";

import ProfileHero from "../components/ProfileHero";
import BodyMetrics from "../components/BodyMetrics";
import JourneyStats from "../components/JourneyStats";
import SettingsGroups from "../components/SettingsGroups";
import UserProfileCard from "../components/UserProfileCard";
import DataCard from "../components/DataCard";
import AboutCard from "../components/AboutCard";

import { useProfile } from "../hooks/useProfile";
import { useSettings } from "../../settings/hooks/SettingsProvider";

export default function ProfilePage() {
  const { stats, loading } = useProfile();
  const { settings } = useSettings();
  const [showEditor, setShowEditor] = useState(false);

  return (
    <Layout>
      <AnimatedPage>
        <div className="space-y-7">
          <ProfileHero
            settings={settings}
            editing={showEditor}
            onToggleEdit={() => setShowEditor((open) => !open)}
          />

          {showEditor && <UserProfileCard onClose={() => setShowEditor(false)} />}

          <BodyMetrics settings={settings} />

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton variant="card" className="h-32" />
              <Skeleton variant="card" className="h-32" />
              <Skeleton variant="card" className="h-32" />
              <Skeleton variant="card" className="h-32" />
            </div>
          ) : (
            <JourneyStats stats={stats} />
          )}

          <SettingsGroups />

          <DataCard />

          <AboutCard />
        </div>
      </AnimatedPage>
    </Layout>
  );
}
