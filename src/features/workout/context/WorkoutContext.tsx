import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import type { WorkoutSession } from "../types/session";

const STORAGE_KEY = "liftlog_active_workout_session";

function loadPersistedSession(): WorkoutSession | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.id &&
      parsed.workoutName &&
      Array.isArray(parsed.exercises)
    ) {
      return {
        ...parsed,
        startedAt: parsed.startedAt ? new Date(parsed.startedAt) : new Date(),
      };
    }
  } catch (e) {
    // Graceful fallback on storage access error or JSON corruption
  }
  return null;
}

function persistSession(session: WorkoutSession | null) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    // Graceful error handling if localStorage quota exceeded or restricted
  }
}

interface WorkoutContextType {
  session: WorkoutSession | null;

  setSession: (
    session: WorkoutSession | null
  ) => void;

  updateSet: (
    exerciseId: string,
    setId: string,
    updates: Partial<{
      weight: number;
      reps: number;
      rir: number;
      completed: boolean;
    }>
  ) => void;

  addSet: (exerciseId: string) => void;

  deleteSet: (exerciseId: string, setId: string) => void;

  removeExercise: (exerciseId: string) => void;

  addExercise: (exercise: { id: string; name: string; exerciseId?: string }) => void;

  resetWorkout: () => void;
}

const WorkoutContext =
  createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSessionState] =
    useState<WorkoutSession | null>(loadPersistedSession);

  function setSession(newSession: WorkoutSession | null) {
    const formatted = newSession
      ? {
          ...newSession,
          startedAt:
            newSession.startedAt instanceof Date
              ? newSession.startedAt
              : new Date(newSession.startedAt),
        }
      : null;
    setSessionState(formatted);
    persistSession(formatted);
  }

  function resetWorkout() {
    setSessionState(null);
    persistSession(null);
  }

  function updateSet(
    exerciseId: string,
    setId: string,
    updates: Partial<{
      weight: number;
      reps: number;
      rir: number;
      completed: boolean;
    }>
  ) {
    setSessionState((prev) => {
      if (!prev) return prev;

      const nextSession = {
        ...prev,
        exercises: prev.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;

          return {
            ...exercise,
            sets: exercise.sets.map((set) => {
              if (set.id !== setId) return set;

              return {
                ...set,
                ...updates,
              };
            }),
          };
        }),
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  function addSet(exerciseId: string) {
    setSessionState((prev) => {
      if (!prev) return prev;

      const nextSession = {
        ...prev,
        exercises: prev.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;

          const lastSet =
            exercise.sets[exercise.sets.length - 1];

          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: crypto.randomUUID(),
                weight: lastSet?.weight ?? 0,
                reps: lastSet?.reps ?? 0,
                rir: lastSet?.rir ?? 2,
                completed: false,
              },
            ],
          };
        }),
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  function deleteSet(exerciseId: string, setId: string) {
    setSessionState((prev) => {
      if (!prev) return prev;

      const nextSession = {
        ...prev,
        exercises: prev.exercises.map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;

          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId),
          };
        }),
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  function removeExercise(exerciseId: string) {
    setSessionState((prev) => {
      if (!prev) return prev;

      const nextSession = {
        ...prev,
        exercises: prev.exercises.filter((exercise) => exercise.id !== exerciseId),
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  function addExercise(exercise: { id: string; name: string; exerciseId?: string }) {
    setSessionState((prev) => {
      if (!prev) return prev;

      const nextSession = {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: exercise.id,
            exerciseId: exercise.exerciseId || exercise.id,
            name: exercise.name,
            sets: [
              {
                id: crypto.randomUUID(),
                weight: 0,
                reps: 0,
                rir: 2,
                completed: false,
              },
            ],
            previous: undefined,
          },
        ],
      };
      persistSession(nextSession);
      return nextSession;
    });
  }

  // Cross-tab synchronization via storage event
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setSessionState(loadPersistedSession());
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Warn before closing tab if workout is active
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (session) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session]);

  return (
    <WorkoutContext.Provider
      value={{
        session,
        setSession,
        updateSet,
        addSet,
        deleteSet,
        removeExercise,
        addExercise,
        resetWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);

  if (!context) {
    throw new Error(
      "useWorkout must be inside WorkoutProvider"
    );
  }

  return context;
}