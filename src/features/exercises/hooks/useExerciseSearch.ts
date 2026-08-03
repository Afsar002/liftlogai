import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exercise } from "../../../types/Exercise";
import {
  searchExercises,
  type ExerciseSearchOptions,
} from "../services/ExerciseService";

interface UseExerciseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: Exercise[];
  isLoading: boolean;
  clear: () => void;
}

/**
 * True when two filter-option objects carry the same selections. Callers often
 * re-create `externalOptions` on every render (e.g. a `{}` default), so we
 * can't compare by reference — only a value change should re-run the search.
 */
function optionsEqual(
  a: ExerciseSearchOptions,
  b: ExerciseSearchOptions
): boolean {
  const keys = new Set<keyof ExerciseSearchOptions>([
    ...(Object.keys(a) as (keyof ExerciseSearchOptions)[]),
    ...(Object.keys(b) as (keyof ExerciseSearchOptions)[]),
  ]);
  for (const key of keys) {
    const left = a[key];
    const right = b[key];
    if (!left && !right) continue;
    if (!left || !right || left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) return false;
    }
  }
  return true;
}

/**
 * Debounced, memoized exercise search. Filters (passed as `externalOptions`)
 * re-run the search when their values change; keystrokes are debounced.
 * All lookups hit ExerciseService's in-memory cache, so results are instant.
 */
export function useExerciseSearch(
  externalOptions: ExerciseSearchOptions = {}
): UseExerciseSearchReturn {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ExerciseSearchOptions>(externalOptions);
  const [results, setResults] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep options in sync when the caller's filter state *value* changes.
  // Guarded by deep-equality: callers re-create the options object every
  // render, so a reference comparison would setState forever (re-render →
  // effect → re-render) and the debounce timer would never fire.
  useEffect(() => {
    if (!optionsEqual(externalOptions, options)) {
      setOptions(externalOptions);
    }
  }, [externalOptions, options]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      searchExercises(query, options)
        .then((next) => {
          setResults(next);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("[useExerciseSearch] search failed:", error);
          setIsLoading(false);
        });
    }, 250);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, options]);

  const clear = useCallback(() => {
    setQuery("");
  }, []);

  return useMemo(
    () => ({ query, setQuery, results, isLoading, clear }),
    [query, results, isLoading, clear]
  );
}
