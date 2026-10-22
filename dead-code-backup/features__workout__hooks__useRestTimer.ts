import { useEffect, useState } from "react";

export function useRestTimer(defaultSeconds = 90) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    if (secondsLeft <= 0) {
      setRunning(false);

      // Notification sound
      new Audio("/notification.mp3").play().catch(() => {});

      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [running, secondsLeft]);

  function start(seconds = defaultSeconds) {
    setSecondsLeft(seconds);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function resume() {
    if (secondsLeft > 0) {
      setRunning(true);
    }
  }

  function reset() {
    setSecondsLeft(defaultSeconds);
    setRunning(false);
  }

  function skip() {
    setSecondsLeft(0);
    setRunning(false);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formatted = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return {
    formatted,
    secondsLeft,
    running,
    start,
    pause,
    resume,
    reset,
    skip,
  };
}