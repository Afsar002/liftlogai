import { useEffect, useState } from "react";

import { AnalyticsService } from "../services/AnalyticsService";

import type { MonthlyTrend } from "../types";

export function useMonthlyTrends() {
  const [data, setData] = useState<MonthlyTrend[]>([]);

  useEffect(() => {
    async function load() {
      setData(
        await AnalyticsService.getMonthlyTrends()
      );
    }

    load();
  }, []);

  return data;
}