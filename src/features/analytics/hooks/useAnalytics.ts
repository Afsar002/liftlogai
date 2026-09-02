import { useEffect, useState } from "react";

import {
  getSummary,
  getWeeklyVolume,
} from "../lib/analytics";
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
      const [summaryData, chartData] = await Promise.all([
        getSummary(),
        getWeeklyVolume(),
      ]);

      setSummary(summaryData);
      setWeeklyVolume(chartData);
    }

    load();
  }, []);

  return {
    summary,
    weeklyVolume,
  };
}