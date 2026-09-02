import { useEffect, useState } from "react";

import { getWorkoutHeatmap } from "../lib/analytics";
import type { HeatmapDay } from "../types";

export function useWorkoutHeatmap() {
  const [data, setData] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    async function load() {
      setData(await getWorkoutHeatmap());
    }
    load();
  }, []);

  return data;
}