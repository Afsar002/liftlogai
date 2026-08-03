import { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiChevronDown, FiSearch, FiFilter, FiClock, FiStar, FiX, FiPlus } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import type { BodyRegion, Exercise } from "../../../types/Exercise";
import { ExerciseService, mapCustomToExercise } from "../../exercises/services/ExerciseService";
import { ExerciseLibraryRepository } from "../../exercises/services/ExerciseLibraryRepository";
import { useExerciseSearch } from "../../exercises/hooks/useExerciseSearch";
import { getRegionIllustrationUrl } from "../../exercises/data/exerciseImages";

/** Max exercises rendered per group when no search query is active. */
const ITEMS_PER_GROUP = 15;

interface Props {
  onSelect: (id: string) => void;
  onClose: () => void;
  existingNames?: string[];
}

const REGION_ORDER: BodyRegion[] = [
  "Chest",
  "Back",
  "Upper Body",
  "Lower Body",
  "Core",
  "Full Body",
  "Cardio",
];

export default function ExercisePickerSheet({
  onSelect,
  onClose,
  existingNames = [],
}: Props) {
  const { query, setQuery, results, clear } = useExerciseSearch();
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [sessionCustoms, setSessionCustoms] = useState<Exercise[]>([]);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
  const [showRecent, setShowRecent] = useState(true);
  const reduceMotion = useReducedMotion() ?? false;

  // Load recent exercises from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("liftlog_recent_exercises");
      if (stored) {
        const parsed = JSON.parse(stored);
        const existing = new Set(existingNames.map((name) => name.toLowerCase()));
        const filtered = parsed.filter(
          (ex: Exercise) => !existing.has(ex.name.toLowerCase())
        ).slice(0, 5);
        setRecentExercises(filtered);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, [existingNames]);

  const available = useMemo(() => {
    const existing = new Set(existingNames.map((name) => name.toLowerCase()));
    return [...sessionCustoms, ...results].filter(
      (exercise) => !existing.has(exercise.name.toLowerCase())
    );
  }, [results, sessionCustoms, existingNames]);

  const groups = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const exercise of available) {
      const region = exercise.bodyRegion;
      if (!map.has(region)) map.set(region, []);
      map.get(region)!.push(exercise);
    }
    const ordered = REGION_ORDER.filter((region) => map.has(region));
    const extra = [...map.keys()]
      .filter((region) => !REGION_ORDER.includes(region as BodyRegion))
      .sort();
    const isSearching = query.trim().length > 0;
    return [...ordered, ...extra].map((region) => {
      const allItems = map.get(region)!;
      const expanded = expandedGroups[region] ?? false;
      const isCapped = !isSearching && allItems.length > ITEMS_PER_GROUP && !expanded;
      return {
        region,
        items: isCapped ? allItems.slice(0, ITEMS_PER_GROUP) : allItems,
        totalCount: allItems.length,
        isCapped,
      };
    });
  }, [available, query, expandedGroups]);

  const visibleGroups =
    selectedRegion === "All"
      ? groups
      : groups.filter((group) => group.region === selectedRegion);

  async function handleCreateCustom(ex: {
    name: string;
    muscle?: string;
    equipment?: string;
  }) {
    const created = await ExerciseLibraryRepository.create(ex);
    ExerciseService.invalidateExerciseCache();
    const mapped = mapCustomToExercise(created);
    setSessionCustoms((current) => [mapped, ...current]);
    onSelect(created.id);
    onClose();
  }

  function handleSelect(id: string) {
    // Add to recent
    const exercise = [...sessionCustoms, ...results].find((e) => e.id === id);
    if (exercise) {
      try {
        const stored = localStorage.getItem("liftlog_recent_exercises");
        const recent = stored ? JSON.parse(stored) : [];
        const filtered = recent.filter((e: Exercise) => e.id !== id);
        const updated = [exercise, ...filtered].slice(0, 10);
        localStorage.setItem("liftlog_recent_exercises", JSON.stringify(updated));
      } catch (e) {
        // Ignore
      }
    }
    onSelect(id);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex flex-col"
      >
        {/* Backdrop */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative flex-1 flex flex-col max-h-[90vh] bg-white rounded-t-3xl shadow-2xl dark:bg-[#0B0B0D] dark:border-t dark:border-white/10"
        >
          {/* Drag Handle */}
          <div className="flex h-12 items-center justify-center">
            <motion.div
              className="h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-white/20"
              animate={reduceMotion ? undefined : { scaleX: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4 border-b border-zinc-200/60 dark:border-white/10">
            <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">Add Exercise</h2>
            <motion.button
              onClick={onClose}
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/8 dark:text-zinc-500 dark:hover:text-zinc-300"
              aria-label="Close"
            >
              <FiX size={20} />
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative px-6 py-4">
            <FiSearch className="absolute left-10 top-1/2 -translate-y-1/2 size-5 text-zinc-400" aria-hidden="true" />
            <input
              type="search"
              role="searchbox"
              aria-label="Search exercises"
              placeholder="Search exercises, muscles, equipment..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50 pl-12 pr-4 py-3 text-zinc-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
            />
            {query && (
              <motion.button
                onClick={clear}
                whileHover={reduceMotion ? undefined : { scale: 1.1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                className="absolute right-10 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-white/8"
                aria-label="Clear search"
              >
                <FiX size={18} />
              </motion.button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="px-4 pb-2">
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
              <FilterChip
                label="All"
                selected={selectedRegion === "All"}
                onClick={() => setSelectedRegion("All")}
                reduceMotion={reduceMotion}
              />
              {groups.map((group) => (
                <FilterChip
                  key={group.region}
                  label={group.region}
                  count={group.totalCount}
                  selected={selectedRegion === group.region}
                  onClick={() => setSelectedRegion(group.region)}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            {/* Recent Exercises */}
            {showRecent && recentExercises.length > 0 && query === "" && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <FiClock size={16} aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Recent</h3>
                  </div>
                  <motion.button
                    onClick={() => setShowRecent(false)}
                    whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                    className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    Hide
                  </motion.button>
                </div>
                <div className="space-y-2">
                  {recentExercises.map((exercise) => (
                    <ExerciseItem
                      key={exercise.id}
                      exercise={exercise}
                      onSelect={handleSelect}
                      isRecent={true}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Grouped Results */}
            {visibleGroups.length > 0 ? (
              visibleGroups.map((group) => (
                <ExerciseGroup
                  key={group.region}
                  group={group}
                  collapsed={Boolean(collapsed[group.region])}
                  onToggle={() =>
                    setCollapsed((current) => ({
                      ...current,
                      [group.region]: !current[group.region],
                    }))
                  }
                  onExpand={() =>
                    setExpandedGroups((current) => ({
                      ...current,
                      [group.region]: true,
                    }))
                  }
                  onSelect={handleSelect}
                  reduceMotion={reduceMotion}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/90 p-8 text-center dark:border-zinc-700 dark:bg-zinc-950/80">
                {query.trim() ? (
                  <>
                    <FiSearch className="mx-auto mb-3 h-10 w-10 text-zinc-400" aria-hidden="true" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      No exercises match "{query}"
                    </p>
                    <CreateCustomExercise
                      onCreated={handleCreateCustom}
                      initialName={query.trim()}
                      reduceMotion={reduceMotion}
                    />
                  </>
                ) : existingNames.length > 0 ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    All available exercises are already added.
                  </p>
                ) : (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No exercises found.
                  </p>
                )}
              </div>
            )}

            {/* Create custom when no results but query exists */}
            {visibleGroups.length === 0 && query.trim() && (
              <CreateCustomExercise
                onCreated={handleCreateCustom}
                initialName={query.trim()}
                reduceMotion={reduceMotion}
              />
            )}
          </div>

          {/* Browse Full Library Link */}
          <motion.div
            className="pt-4 border-t border-zinc-200/60 dark:border-white/10"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 380, damping: 32 }}
          >
            <a
              href="/exercises"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 p-3 text-center text-sm font-semibold text-zinc-600 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-emerald-400"
            >
              <FiFilter size={18} aria-hidden="true" />
              Browse Full Exercise Library
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FilterChip({
  label,
  count,
  selected,
  onClick,
  reduceMotion,
}: {
  label: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
  reduceMotion: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={cn(
        "flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "bg-emerald-500 text-emerald-950 shadow-sm"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
            selected ? "bg-white/20 text-white" : "bg-white/50 text-zinc-500"
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

function ExerciseGroup({
  group,
  collapsed,
  onToggle,
  onExpand,
  onSelect,
  reduceMotion,
}: {
  group: { region: string; items: Exercise[]; totalCount: number; isCapped: boolean };
  collapsed: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onSelect: (id: string) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
          {group.region}
          <span className="ml-1.5 text-xs font-normal text-zinc-400">{group.totalCount}</span>
        </h3>
        <motion.button
          onClick={onToggle}
          whileHover={reduceMotion ? undefined : { scale: 1.1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          {collapsed ? "Expand" : "Collapse"}
        </motion.button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="space-y-2"
          >
            {group.items.map((exercise) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onSelect={onSelect}
              />
            ))}
            {group.isCapped && (
              <button
                onClick={onExpand}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-emerald-400"
              >
                <FiChevronDown size={16} aria-hidden="true" />
                Show all {group.totalCount} exercises
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseItem({
  exercise,
  onSelect,
  isRecent = false,
}: {
  exercise: Exercise;
  onSelect: (id: string) => void;
  isRecent?: boolean;
}) {
  // Use actual exercise thumbnail if available, otherwise fall back to region illustration
  const thumbnailUrl = exercise.thumbnail 
    ? `/src/assets/exercises/thumbnails/${exercise.thumbnail}`
    : exercise.bodyRegion ? getRegionIllustrationUrl(exercise.bodyRegion as any) : '';

  return (
    <button
      type="button"
      onClick={() => onSelect(exercise.id)}
      className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left text-zinc-900 shadow-sm transition-transform duration-150 ease-out hover:translate-x-1 hover:bg-zinc-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
    >
      {/* Exercise thumbnail or region illustration */}
      <div
        className="h-11 w-11 shrink-0 rounded-lg bg-zinc-100 dark:bg-white/8 bg-cover bg-center"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
        role="img"
        aria-label={exercise.name}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium truncate">{exercise.name}</span>
          {isRecent && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
              <FiClock size={8} aria-hidden="true" />
              Recent
            </span>
          )}
        </div>
        <div className="truncate text-sm text-zinc-600 dark:text-zinc-400">
          {exercise.primaryMuscles.join(", ")} • {exercise.equipment}
        </div>
      </div>
      <FiChevronRight className="shrink-0 text-zinc-400" aria-hidden="true" />
    </button>
  );
}

function CreateCustomExercise({
  onCreated,
  initialName = "",
  reduceMotion,
}: {
  onCreated: (ex: { name: string; muscle?: string; equipment?: string }) => void;
  initialName?: string;
  reduceMotion: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="space-y-2 rounded-2xl border border-dashed border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <FiPlus size={16} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <span>No match — create a custom exercise:</span>
      </div>

      <input
        placeholder="Exercise name"
        aria-label="Custom exercise name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        autoFocus
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Muscle (optional)"
          aria-label="Custom exercise muscle"
          value={muscle}
          onChange={(event) => setMuscle(event.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <input
          placeholder="Equipment (optional)"
          aria-label="Custom exercise equipment"
          value={equipment}
          onChange={(event) => setEquipment(event.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div className="flex justify-end">
        <motion.button
          type="button"
          disabled={!name.trim()}
          onClick={() => onCreated({ name: name.trim(), muscle: muscle.trim(), equipment: equipment.trim() })}
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus size={16} aria-hidden="true" />
          Add Exercise
        </motion.button>
      </div>
    </motion.div>
  );
}