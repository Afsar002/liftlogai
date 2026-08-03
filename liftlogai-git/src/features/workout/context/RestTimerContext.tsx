import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSettings } from "../../settings/hooks/SettingsProvider";

const TIMER_STORAGE_KEY = "liftlog_rest_timer_state";

interface StoredRestTimer {
  endTime: number | null;
  pausedRemaining: number | null;
  running: boolean;
  defaultTime: number;
}

function loadRestTimerState(): StoredRestTimer | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveRestTimerState(state: StoredRestTimer | null) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (state) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }
  } catch (e) {
    // Graceful error handling if storage restricted or quota exceeded
  }
}

interface RestTimerContextType {
  secondsLeft: number;
  formatted: string;
  running: boolean;

  start: (seconds?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

const RestTimerContext =
  createContext<RestTimerContextType | null>(null);

export function RestTimerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { settings } = useSettings();
  const DEFAULT_TIME = settings?.defaultRestTimer ?? 90;

  const [endTime, setEndTime] = useState<number | null>(() => {
    const stored = loadRestTimerState();
    return stored?.endTime ?? null;
  });

  const [pausedRemaining, setPausedRemaining] = useState<number | null>(() => {
    const stored = loadRestTimerState();
    return stored?.pausedRemaining ?? null;
  });

  const [running, setRunning] = useState<boolean>(() => {
    const stored = loadRestTimerState();
    if (stored?.running && stored.endTime) {
      return stored.endTime > Date.now();
    }
    return false;
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const stored = loadRestTimerState();
    if (stored?.running && stored.endTime) {
      return Math.max(0, Math.ceil((stored.endTime - Date.now()) / 1000));
    }
    if (stored?.pausedRemaining !== null && stored?.pausedRemaining !== undefined) {
      return stored.pausedRemaining;
    }
    return DEFAULT_TIME;
  });

  // Keep state synced with localStorage
  useEffect(() => {
    if (running || pausedRemaining !== null) {
      saveRestTimerState({
        endTime,
        pausedRemaining,
        running,
        defaultTime: DEFAULT_TIME,
      });
    } else {
      saveRestTimerState(null);
    }
  }, [endTime, pausedRemaining, running, DEFAULT_TIME]);

  // Main timer tick effect
  useEffect(() => {
    if (!running || !endTime) return;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setRunning(false);
        setEndTime(null);
        setPausedRemaining(0);
        saveRestTimerState(null);

        new Audio("/notification.mp3")
          .play()
          .catch(() => {});
      }
    };

    tick();
    const interval = setInterval(tick, 250);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [running, endTime]);

  function start(seconds = DEFAULT_TIME) {
    const newEndTime = Date.now() + seconds * 1000;
    setEndTime(newEndTime);
    setPausedRemaining(null);
    setSecondsLeft(seconds);
    setRunning(true);
  }

  function pause() {
    if (running && endTime) {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setPausedRemaining(remaining);
      setSecondsLeft(remaining);
      setEndTime(null);
      setRunning(false);
    }
  }

  function resume() {
    const remainingToUse = pausedRemaining ?? secondsLeft;
    if (remainingToUse > 0) {
      const newEndTime = Date.now() + remainingToUse * 1000;
      setEndTime(newEndTime);
      setPausedRemaining(null);
      setRunning(true);
    }
  }

  function reset() {
    setEndTime(null);
    setPausedRemaining(null);
    setSecondsLeft(DEFAULT_TIME);
    setRunning(false);
    saveRestTimerState(null);
  }

  function skip() {
    setEndTime(null);
    setPausedRemaining(null);
    setSecondsLeft(0);
    setRunning(false);
    saveRestTimerState(null);
  }

  const formatted = `${Math.floor(
    secondsLeft / 60
  )}:${(secondsLeft % 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <RestTimerContext.Provider
      value={{
        secondsLeft,
        formatted,
        running,
        start,
        pause,
        resume,
        reset,
        skip,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
}

export function useRestTimer() {
  const context = useContext(RestTimerContext);

  if (!context) {
    throw new Error(
      "useRestTimer must be inside RestTimerProvider"
    );
  }

  return context;
}