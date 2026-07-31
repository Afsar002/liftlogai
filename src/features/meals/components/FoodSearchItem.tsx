import type { FoodSearchResult } from '../types';

interface FoodSearchItemProps {
  food: FoodSearchResult;
  onSelect: (food: FoodSearchResult) => void;
}

export default function FoodSearchItem({ food, onSelect }: FoodSearchItemProps) {
  const sourceBadge = {
    local: { label: 'Local', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cached: { label: 'Cached', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    api: { label: 'Online', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    custom: { label: 'Custom', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  };

  const badge = sourceBadge[food.source];

  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {food.name}
          </p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge.class} shrink-0`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {food.calories} kcal
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">·</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {food.servingSize} {food.servingUnit}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-red-500/70">P {food.protein}g</span>
          <span className="text-[11px] text-blue-500/70">C {food.carbs}g</span>
          <span className="text-[11px] text-yellow-500/70">F {food.fat}g</span>
        </div>
      </div>
      <svg className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}