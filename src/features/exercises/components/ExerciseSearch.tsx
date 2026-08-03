import { FiSearch, FiX } from "react-icons/fi";
import { cn } from "../../../shared/lib/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  className?: string;
}

/** Search input for the Exercise Library. Debounced upstream in the hook. */
export default function ExerciseSearch({
  value,
  onChange,
  placeholder = "Search exercises, muscles, equipment...",
  resultCount,
  className,
}: Props) {
  return (
    <div className={cn("relative", className)}>
      <FiSearch
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        aria-hidden="true"
      />

      <input
        type="search"
        role="searchbox"
        aria-label="Search exercises"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-200/80 bg-white py-3 pl-11 pr-10 text-zinc-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-white/10 dark:bg-[#141417] dark:text-white dark:placeholder:text-zinc-500"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <FiX size={16} />
        </button>
      ) : null}

      {resultCount !== undefined && value && (
        <span className="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
