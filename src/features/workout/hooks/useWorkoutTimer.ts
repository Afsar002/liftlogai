import { useEffect, useState } from "react";

export function useWorkoutTimer(startedAt: Date | string) {
  const getStartMs = () => {
    if (!startedAt) return Date.now();
    return typeof startedAt === "string"
      ? new Date(startedAt).getTime()
      : startedAt.getTime();
  };

  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Date.now() - getStartMs())
  );

  useEffect(() => {
    const startMs = getStartMs();

    const updateTimer = () => {
      setElapsed(Math.max(0, Date.now() - startMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3_600_000);
  const minutes = Math.floor((elapsed % 3_600_000) / 60_000);
  const seconds = Math.floor((elapsed % 60_000) / 1000);

  const formatted = [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");

  return {
    elapsed,
    formatted,
  };
}