import { memo, useState } from "react";
import { FiFilter, FiChevronDown, FiX } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";
import Button from "../../../shared/components/ui/Button";
import type {
  ExerciseFilterKey,
  ExerciseFiltersState,
  ExerciseFilterOptions,
} from "../hooks/useExerciseFilters";

interface Props {
  filters: ExerciseFiltersState;
  available: ExerciseFilterOptions;
  toggle: (key: ExerciseFilterKey, value: string) => void;
  clear: (key: ExerciseFilterKey) => void;
  clearAll: () => void;
  activeCount: number;
}

const DIMENSIONS: { key: ExerciseFilterKey; label: string }[] = [
  { key: "muscles", label: "Muscle" },
  { key: "equipment", label: "Equipment" },
  { key: "difficulty", label: "Difficulty" },
  { key: "category", label: "Category" },
  { key: "force", label: "Force" },
  { key: "mechanic", label: "Mechanic" },
  { key: "bodyRegion", label: "Body Region" },
];

/**
 * Multi-select filter panel. Options are toggled as chips; selections combine
 * with AND across dimensions. Collapsed by default to keep the grid in view.
 */
function ExerciseFiltersInner({ filters, available, toggle, clear, clearAll, activeCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="exercise-filters-panel"
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
            activeCount > 0
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-200 dark:hover:bg-white/12"
          )}
        >
          <FiFilter size={16} aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-black/15 px-1.5 text-xs font-bold">{activeCount}</span>
          )}
          <FiChevronDown
            size={16}
            className={cn("transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      {open && (
        <div
          id="exercise-filters-panel"
          className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-card dark:border-white/6 dark:bg-[#141417]"
        >
          {DIMENSIONS.map(({ key, label }) => {
            const selected = filters[key] as unknown as readonly string[];
            const options = (available[key] as unknown as readonly string[]) ?? [];
            if (options.length === 0) return null;

            return (
              <fieldset key={key}>
                <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {label}
                  {selected.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clear(key)}
                      className="text-xs font-normal text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Clear
                    </button>
                  )}
                </legend>

                <div className="flex flex-wrap gap-1.5">
                  {options.map((option) => {
                    const active = selected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggle(key, option)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-white/12"
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          {activeCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3 dark:border-white/6">
              {DIMENSIONS.flatMap(({ key }) =>
                (filters[key] as unknown as readonly string[]).map((value) => (
                  <button
                    key={`${key}:${value}`}
                    type="button"
                    onClick={() => clear(key)}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/25 dark:text-emerald-400"
                  >
                    {value}
                    <FiX size={12} aria-hidden="true" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const ExerciseFilters = memo(ExerciseFiltersInner);
export default ExerciseFilters;
