import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { FoodSearchResult } from '../types';
import { FoodRepository } from '../repository/FoodRepository';

interface UseFoodSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: FoodSearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (q: string) => Promise<void>;
  clearSearch: () => void;
}

export function useFoodSearch(): UseFoodSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef('');

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      return;
    }

    lastQueryRef.current = trimmed;
    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await FoodRepository.searchFoods(trimmed);

      if (lastQueryRef.current === trimmed) {
        setResults(searchResults);
        if (searchResults.length === 0) {
          setError('No foods found. Try a different search term.');
        }
      }
    } catch {
      if (lastQueryRef.current === trimmed) {
        setError('Search failed. Please try again.');
        setResults([]);
      }
    } finally {
      if (lastQueryRef.current === trimmed) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return useMemo(
    () => ({
      query,
      setQuery,
      results,
      isLoading,
      error,
      search,
      clearSearch,
    }),
    [query, results, isLoading, error, search, clearSearch]
  );
}