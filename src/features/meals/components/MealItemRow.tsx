import { useMemo } from 'react';
import type { MealItem } from '../types';
import { NutritionService } from '../services/NutritionService';
import { useSettings } from '../../settings/hooks/SettingsProvider';

interface MealItemRowProps {
  item: MealItem;
  onEditQuantity: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
}

export default function MealItemRow({ item, onEditQuantity, onDelete, onDuplicate }: MealItemRowProps) {
  const { settings } = useSettings();
  const expertMode = settings?.expertMode || false;
  
  const macros = useMemo(
    () => NutritionService.calculateItemCalories(item, expertMode),
    [item.quantity, item.servingSize, item.calories, item.protein, item.carbs, item.fat, expertMode]
  );

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
          {item.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {item.quantity} {item.servingUnit}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">·</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {macros.calories} kcal
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">·</span>
          <span className="text-xs text-red-500/70">P{macros.protein}</span>
          <span className="text-xs text-blue-500/70">C{macros.carbs}</span>
          <span className="text-xs text-yellow-500/70">F{macros.fat}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onEditQuantity(item.id)}
          className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
          title="Edit quantity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onDuplicate(item.id)}
          className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
          title="Duplicate"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}