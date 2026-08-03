import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSettings } from "../../settings/hooks/SettingsProvider";

const TIMER_STORAGE_KEY = "liftlog_rest_timer_state";
const VOICE_STORAGE_KEY = "liftlog_rest_timer_voice";

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

function loadVoiceEnabled(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return true;
    const raw = localStorage.getItem(VOICE_STORAGE_KEY);
    if (!raw) return true;
    return JSON.parse(raw);
  } catch (e) {
    return true;
  }
}

function saveVoiceEnabled(enabled: boolean) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(enabled));
  } catch (e) {
    // Graceful error handling
  }
}

interface RestTimerContextType {
  secondsLeft: number;
  formatted: string;
  running: boolean;
  duration: number;
  isIdle: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;

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

  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() =>
    loadVoiceEnabled()
  );

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

  // Keep the displayed time in sync with the default while the timer is idle.
  // Settings load asynchronously, so DEFAULT_TIME can change after mount
  // (e.g. 90 → the user's saved value). Without this, secondsLeft would drift
  // from duration and the overlay's idle check (secondsLeft === duration)
  // would fail, showing the rest timer even though it was never started.
  useEffect(() => {
    if (!running && pausedRemaining === null) {
      setSecondsLeft(DEFAULT_TIME);
    }
  }, [DEFAULT_TIME, running, pausedRemaining]);

  // Persist voice preference
  useEffect(() => {
    saveVoiceEnabled(voiceEnabled);
  }, [voiceEnabled]);

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

        // Play completion sound
        if (voiceEnabled) {
          speak("Rest complete");
        } else {
          new Audio("/notification.mp3")
            .play()
            .catch(() => {});
        }
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
  }, [running, endTime, voiceEnabled]);

  // Speech synthesis for voice cues
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

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

  // True when the timer has never been started, has been reset, or has
  // finished (completed or skipped). The overlay uses this to decide whether
  // to render — it must not depend on secondsLeft === duration, because
  // settings load asynchronously and duration can change after mount.
  const isIdle =
    !running &&
    endTime === null &&
    (pausedRemaining === null || pausedRemaining === 0);

  return (
    <RestTimerContext.Provider
      value={{
        secondsLeft,
        formatted,
        running,
        duration: DEFAULT_TIME,
        isIdle,
        voiceEnabled,
        setVoiceEnabled,
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