import { useEffect, useState } from "react";

import {
  DashboardRepository,
  type DashboardStats,
} from "../services/DashboardRepository";

export function useDashboard() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      const data =
        await DashboardRepository.getDashboardStats();

      setStats(data);

      setLoading(false);
    }

    load();
  }, []);

  return {
    stats,
    loading,
  };
}