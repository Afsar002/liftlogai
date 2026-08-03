import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiPlus } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import type { BodyRegion, Exercise } from "../../../types/Exercise";
import * as ExerciseService from "../services/ExerciseService";
import { ExerciseLibraryRepository } from "../services/ExerciseLibraryRepository";
import { useExerciseSearch } from "../hooks/useExerciseSearch";
import ExerciseImage from "./ExerciseImage";

interface Props {
  onSelect(id: string): void;
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

/**
 * The single exercise picker used across Workout Builder, Templates, and the
 * active Workout Session. Powered by ExerciseService (bundled dataset + custom
 * exercises) with debounced search, body-region grouping, and custom creation.
 */
export default function ExercisePicker({ onSelect, existingNames = [] }: Props) {
  const { query, setQuery, results } = useExerciseSearch();
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sessionCustoms, setSessionCustoms] = useState<Exercise[]>([]);

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
    return [...ordered, ...extra].map((region) => ({
      region,
      items: map.get(region)!,
    }));
  }, [available]);

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
    // Invalidate the cache so persisted custom exercises show up everywhere.
    ExerciseService.invalidateExerciseCache();
    const mapped = ExerciseService.mapCustomToExercise(created);
    setSessionCustoms((current) => [mapped, ...current]);
    onSelect(created.id);
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        role="searchbox"
        aria-label="Search exercises"
        placeholder="Search exercises, muscles, equipment..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3.5 text-sm font-semibold text-zinc-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-white/8 dark:bg-white/8 dark:text-white dark:placeholder:text-zinc-500"
      />

      {/* Body-region tabs */}
      <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setSelectedRegion("All")}
          className={cn(
            "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
            selectedRegion === "All"
              ? "bg-zinc-900 text-white dark:bg-emerald-500 dark:text-emerald-950"
              : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          )}
        >
          All
        </button>
        {groups.map((group) => (
          <button
            key={group.region}
            type="button"
            onClick={() => setSelectedRegion(group.region)}
            className={cn(
              "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              selectedRegion === group.region
                ? "bg-zinc-900 text-white dark:bg-emerald-500 dark:text-emerald-950"
                : "bg-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            {group.region}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="max-h-[60vh] space-y-4 overflow-y-auto">
        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <div key={group.region}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {group.region}
                  <span className="ml-1.5 text-[11px] font-semibold normal-case text-zinc-400">
                    {group.items.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((current) => ({
                      ...current,
                      [group.region]: !current[group.region],
                    }))
                  }
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  {collapsed[group.region] ? "Expand" : "Collapse"}
                </button>
              </div>

              {!collapsed[group.region] && (
                <div className="space-y-2">
                  {group.items.map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => onSelect(exercise.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-3 text-left shadow-sm transition hover:border-emerald-400/40 hover:bg-emerald-500/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:border-white/8 dark:bg-[#141417] dark:hover:border-emerald-500/30"
                    >
                      <ExerciseImage
                        exercise={exercise}
                        className="h-12 w-12 shrink-0 rounded-xl"
                        imgClassName="rounded-xl"
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                          {exercise.name}
                        </div>
                        <div className="mt-0.5 truncate text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          {exercise.primaryMuscles.join(", ")} • {exercise.equipment}
                        </div>
                      </div>
                      <FiChevronRight className="shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-5 text-center text-sm font-semibold text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            {existingNames.length > 0
              ? "All available exercises are already added."
              : "No matching exercises found."}
          </div>
        )}

        {/* Create custom exercise when nothing matches */}
        {available.length === 0 && query.trim() && (
          <CreateCustomExercise onCreated={handleCreateCustom} />
        )}
      </div>

      {/* Browse full library */}
      <Link
        to="/exercises"
        className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-zinc-300 p-3 text-center text-sm font-bold text-zinc-600 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-white/10 dark:text-zinc-300 dark:hover:text-emerald-400"
      >
        <FiPlus size={14} aria-hidden="true" />
        Browse the full exercise library
      </Link>
    </div>
  );
}

function CreateCustomExercise({
  onCreated,
}: {
  onCreated(ex: { name: string; muscle?: string; equipment?: string }): void;
}) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");

  return (
    <div className="space-y-2.5 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#141417]">
      <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
        No match — create a custom exercise:
      </div>

      <input
        placeholder="Exercise name"
        aria-label="Custom exercise name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full rounded-xl border border-zinc-200/70 bg-zinc-50 p-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-white/8 dark:bg-white/8 dark:text-white"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Muscle (optional)"
          aria-label="Custom exercise muscle"
          value={muscle}
          onChange={(event) => setMuscle(event.target.value)}
          className="rounded-xl border border-zinc-200/70 bg-zinc-50 p-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-white/8 dark:bg-white/8 dark:text-white"
        />
        <input
          placeholder="Equipment (optional)"
          aria-label="Custom exercise equipment"
          value={equipment}
          onChange={(event) => setEquipment(event.target.value)}
          className="rounded-xl border border-zinc-200/70 bg-zinc-50 p-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-white/8 dark:bg-white/8 dark:text-white"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onCreated({ name: name.trim(), muscle: muscle.trim(), equipment: equipment.trim() })}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2 text-sm font-extrabold text-emerald-950 shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          Add exercise
        </button>
      </div>
    </div>
  );
}
