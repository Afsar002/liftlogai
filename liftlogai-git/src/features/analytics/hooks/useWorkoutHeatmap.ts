import { useEffect, useState } from "react";

import { AnalyticsService } from "../services/AnalyticsService";

import type { HeatmapDay } from "../types";

export function useWorkoutHeatmap() {
  const [data, setData] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    async function load() {
      const result =
        await AnalyticsService.getWorkoutHeatmap();

      setData(result);
    }

    load();
  }, []);

  return data;
}