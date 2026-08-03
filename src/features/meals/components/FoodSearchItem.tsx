import { FiChevronRight } from 'react-icons/fi';
import type { FoodSearchResult } from '../types';

interface FoodSearchItemProps {
  food: FoodSearchResult;
  onSelect: (food: FoodSearchResult) => void;
}

export default function FoodSearchItem({ food, onSelect }: FoodSearchItemProps) {
  const sourceBadge = {
    local: { label: 'Local', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    cached: { label: 'Cached', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    api: { label: 'Online', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    custom: { label: 'Custom', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  };

  const badge = sourceBadge[food.source];

  return (
    <button
      onClick={() => onSelect(food)}
      className="flex w-full items-center justify-between border-b border-zinc-100 px-5 py-3 text-left transition-colors hover:bg-zinc-50 last:border-b-0 dark:border-white/6 dark:hover:bg-white/5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
            {food.name}
          </p>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.class}`}>
            {badge.label}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {food.calories} kcal
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">·</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {food.servingSize} {food.servingUnit}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[11px] text-red-500/70">P {food.protein}g</span>
          <span className="text-[11px] text-blue-500/70">C {food.carbs}g</span>
          <span className="text-[11px] text-yellow-500/70">F {food.fat}g</span>
        </div>
      </div>
      <FiChevronRight className="ml-2 h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
    </button>
  );
}
