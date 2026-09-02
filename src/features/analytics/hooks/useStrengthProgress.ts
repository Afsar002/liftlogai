import { useEffect, useState } from "react";

import { getStrengthProgress } from "../lib/analytics";
import type { StrengthProgressPoint } from "../types";

export function useStrengthProgress(
  exerciseId: string
) {
  const [data, setData] = useState<
    StrengthProgressPoint[]
  >([]);

  useEffect(() => {
    if (!exerciseId) return;

    async function load() {
      const result = await getStrengthProgress(exerciseId);
      setData(result);
    }

    load();
  }, [exerciseId]);

  return data;
}