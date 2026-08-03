import { useEffect, useState } from "react";

import { ProfileService } from "../services/ProfileService";
import type { ProfileStats } from "../types";

const emptyStats: ProfileStats = {
  templateCount: 0,
  exerciseCount: 0,
  completedWorkouts: 0,
  trainingHours: 0,
  streak: 0,
};

export function useProfile() {
  const [stats, setStats] =
    useState(emptyStats);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {
    setLoading(true);

    const data =
      await ProfileService.getStats();

    setStats(data);

    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  return {
    stats,
    loading,
    refresh,
  };
}