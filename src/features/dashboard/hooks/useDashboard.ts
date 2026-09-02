import { useEffect, useState } from "react";

import {
  getDashboardStats,
  type DashboardStats,
} from "../../../shared/lib/StatisticsEngine";

export function useDashboard() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  return { stats, loading };
}