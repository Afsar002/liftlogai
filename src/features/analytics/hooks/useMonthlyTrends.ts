import { useEffect, useState } from "react";

import { getMonthlyTrends } from "../lib/analytics";
import type { MonthlyTrend } from "../types";

export function useMonthlyTrends() {
  const [data, setData] = useState<MonthlyTrend[]>([]);

  useEffect(() => {
    async function load() {
      setData(await getMonthlyTrends());
    }
    load();
  }, []);

  return data;
}