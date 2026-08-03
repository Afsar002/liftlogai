import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BodyRegion,
  ExerciseCategory,
  ExerciseDifficulty,
  ExerciseEquipment,
  ExerciseForce,
  ExerciseMechanic,
  Muscle,
} from "../../../types/Exercise";
import {
  getFilterOptions,
  type ExerciseSearchOptions,
} from "../services/ExerciseService";

/** Filter dimensions and their selected values (empty array = no filter). */
export interface ExerciseFiltersState {
  equipment: ExerciseEquipment[];
  muscles: Muscle[];
  category: ExerciseCategory[];
  difficulty: ExerciseDifficulty[];
  force: ExerciseForce[];
  mechanic: ExerciseMechanic[];
  bodyRegion: BodyRegion[];
}

export type ExerciseFilterKey = keyof ExerciseFiltersState;

/** Available values per dimension, derived from the dataset. */
export interface ExerciseFilterOptions extends ExerciseFiltersState {}

const emptyFilters = (): ExerciseFiltersState => ({
  equipment: [],
  muscles: [],
  category: [],
  difficulty: [],
  force: [],
  mechanic: [],
  bodyRegion: [],
});

const emptyOptions = (): ExerciseFilterOptions => emptyFilters();

interface UseExerciseFiltersReturn {
  filters: ExerciseFiltersState;
  available: ExerciseFilterOptions;
  toggle: (key: ExerciseFilterKey, value: string) => void;
  clear: (key: ExerciseFilterKey) => void;
  clearAll: () => void;
  activeCount: number;
  /** Converted to ExerciseSearchOptions for the search hook (empty keys omitted). */
  searchOptions: ExerciseSearchOptions;
}

/**
 * Multi-select filter state for the Exercise Library. Values are toggled per
 * dimension and combined with AND across dimensions (OR within a dimension).
 */
export function useExerciseFilters(): UseExerciseFiltersReturn {
  const [filters, setFilters] = useState<ExerciseFiltersState>(emptyFilters);
  const [available, setAvailable] = useState<ExerciseFilterOptions>(emptyOptions);

  useEffect(() => {
    let mounted = true;
    getFilterOptions().then((options) => {
      if (mounted) setAvailable(options);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggle = useCallback((key: ExerciseFilterKey, value: string) => {
    setFilters((prev) => {
      const list = prev[key] as unknown as string[];
      const next = list.includes(value)
        ? list.filter((existing) => existing !== value)
        : [...list, value];
      return { ...prev, [key]: next as ExerciseFiltersState[typeof key] };
    });
  }, []);

  const clear = useCallback((key: ExerciseFilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: [] as ExerciseFiltersState[typeof key] }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(emptyFilters());
  }, []);

  const activeCount = useMemo(
    () =>
      Object.values(filters).reduce<number>((total, list) => total + list.length, 0),
    [filters]
  );

  const searchOptions = useMemo<ExerciseSearchOptions>(() => {
    const options: ExerciseSearchOptions = {};
    if (filters.equipment.length) options.equipment = filters.equipment;
    if (filters.muscles.length) options.muscles = filters.muscles;
    if (filters.category.length) options.category = filters.category;
    if (filters.difficulty.length) options.difficulty = filters.difficulty;
    if (filters.force.length) options.force = filters.force;
    if (filters.mechanic.length) options.mechanic = filters.mechanic;
    if (filters.bodyRegion.length) options.bodyRegion = filters.bodyRegion;
    return options;
  }, [filters]);

  return {
    filters,
    available,
    toggle,
    clear,
    clearAll,
    activeCount,
    searchOptions,
  };
}
