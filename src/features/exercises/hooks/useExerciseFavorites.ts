import { useCallback, useEffect, useMemo, useState } from "react";
import type { Exercise } from "../../../types/Exercise";
import { getFavorites, getFavoriteIds, toggleFavorite as serviceToggle } from "../services/ExerciseService";

interface UseExerciseFavoritesReturn {
  favorites: Exercise[];
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  count: number;
}

/**
 * Loads the user's favorite exercises from localStorage (via ExerciseService)
 * and provides an optimistic toggle. Favorite ids are kept in sync so the
 * library grid and details screen always agree.
 */
export function useExerciseFavorites(): UseExerciseFavoritesReturn {
  const [favorites, setFavorites] = useState<Exercise[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const [ids, exercises] = await Promise.all([getFavoriteIds(), getFavorites()]);
    setFavoriteIds(ids);
    setFavorites(exercises);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const nowFavorite = await serviceToggle(id);
      setFavoriteIds((prev) =>
        nowFavorite ? [id, ...prev] : prev.filter((existing) => existing !== id)
      );
      return nowFavorite;
    },
    []
  );

  return useMemo(
    () => ({
      favorites,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      refresh,
      count: favoriteIds.length,
    }),
    [favorites, favoriteIds, isFavorite, toggleFavorite, refresh]
  );
}
