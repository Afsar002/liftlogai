import { useEffect, useMemo, useState } from "react";
import Layout from "../../../shared/components/layout/Layout";
import EmptyState from "../../../shared/components/ui/EmptyState";
import { cn } from "../../../shared/lib/cn";
import { AnimatedSearch, AnimatedTabIndicator } from "../../../shared/components/motion";
import { FiClock, FiHeart, FiGrid, FiWifiOff } from "react-icons/fi";
import type { Exercise } from "../../../types/Exercise";
import * as ExerciseService from "../services/ExerciseService";
import { useExerciseSearch } from "../hooks/useExerciseSearch";
import { useExerciseFilters } from "../hooks/useExerciseFilters";
import { useExerciseFavorites } from "../hooks/useExerciseFavorites";
import ExerciseSearchInput from "../components/ExerciseSearch";
import ExerciseFilters from "../components/ExerciseFilters";
import ExerciseCard from "../components/ExerciseCard";

type LibraryTab = "all" | "favorites" | "recent";

const TABS: { key: LibraryTab; label: string; icon: typeof FiGrid }[] = [
  { key: "all", label: "All", icon: FiGrid },
  { key: "favorites", label: "Favorites", icon: FiHeart },
  { key: "recent", label: "Recent", icon: FiClock },
];

export default function ExerciseLibraryPage() {
  const filters = useExerciseFilters();
  const search = useExerciseSearch(filters.searchOptions);
  const favorites = useExerciseFavorites();
  const [tab, setTab] = useState<LibraryTab>("all");
  const [recent, setRecent] = useState<Exercise[]>([]);
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    ExerciseService.getRecent().then((items) => {
      if (mounted) setRecent(items);
    });
    ExerciseService.getAllExercises().then((all) => {
      if (mounted) setExerciseCount(all.length);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (tab === "favorites") return favorites.favorites;
    if (tab === "recent") return recent;
    return search.results;
  }, [tab, favorites.favorites, recent, search.results]);

  const filteredByQuery = useMemo(() => {
    const q = search.query.trim().toLowerCase();
    if (!q || tab === "all") return visible;
    return visible.filter((exercise) => exercise.name.toLowerCase().includes(q));
  }, [visible, search.query, tab]);

  const isEmpty = filteredByQuery.length === 0;
  const isLoading = search.isLoading && search.results.length === 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-6 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
                  Library
                </span>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
                  Exercise Library
                </h1>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  Search, filter, and favorite your go-to movements — everything works offline.
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
                <FiWifiOff size={13} aria-hidden="true" />
                Offline
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
                <FiGrid size={11} aria-hidden="true" />
                {exerciseCount === null ? "…" : exerciseCount.toLocaleString()} movements
              </span>
            </div>

            {tab === "all" && (
              <div className="mt-4">
                <ExerciseSearchInput
                  value={search.query}
                  onChange={search.setQuery}
                  resultCount={search.query ? search.results.length : undefined}
                />
              </div>
            )}
          </div>
        </section>

        {/* Segmented tabs */}
        <div
          className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-white/8"
          role="tablist"
          aria-label="Exercise library sections"
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-colors",
                tab === key
                  ? "text-emerald-950"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {tab === key && (
                <AnimatedTabIndicator layoutId="library-tab" className="rounded-full" />
              )}

              <span className="relative z-10 inline-flex items-center gap-2">
                <Icon size={16} aria-hidden="true" />
                {label}
              </span>
            </button>
          ))}
        </div>

        {tab === "all" && (
          <ExerciseFilters
            filters={filters.filters}
            available={filters.available}
            toggle={filters.toggle}
            clear={filters.clear}
            clearAll={filters.clearAll}
            activeCount={filters.activeCount}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-white/6 dark:bg-[#141417]"
              >
                <div className="aspect-[4/3] w-full animate-pulse bg-zinc-200 dark:bg-white/8" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-white/8" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-white/8" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={tab === "favorites" ? <FiHeart /> : tab === "recent" ? <FiClock /> : <FiGrid />}
            title={
              tab === "favorites"
                ? "No favorite exercises yet"
                : tab === "recent"
                  ? "No recently viewed exercises"
                  : "No exercises found"
            }
            description={
              tab === "favorites"
                ? "Tap the heart on any exercise to save it here for quick access."
                : tab === "recent"
                  ? "Exercises you open will show up here."
                  : "Try a different search term or clear your filters."
            }
          />
        ) : (
          <AnimatedSearch
            query={`${tab}:${search.query}`}
            className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredByQuery.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isFavorite={favorites.isFavorite(exercise.id)}
                onToggleFavorite={(id) => favorites.toggleFavorite(id)}
              />
            ))}
          </AnimatedSearch>
        )}
      </div>
    </Layout>
  );
}
