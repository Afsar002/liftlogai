import { useEffect, useState } from "react";

import { AnalyticsService } from "../services/AnalyticsService";
import type { AnalyticsSummary } from "../types";

interface WeeklyVolumeData {
  day: string;
  volume: number;
}

export function useAnalytics() {
  const [summary, setSummary] =
    useState<AnalyticsSummary | null>(null);

  const [weeklyVolume, setWeeklyVolume] =
    useState<WeeklyVolumeData[]>([]);

  useEffect(() => {
    async function load() {
      const summaryData =
        await AnalyticsService.getSummary();

      setSummary(summaryData);

      const chartData =
        await AnalyticsService.getWeeklyVolume();

      setWeeklyVolume(chartData);
    }

    load();
  }, []);

  return {
    summary,
    weeklyVolume,
  };
}