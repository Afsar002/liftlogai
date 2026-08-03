import { useMemo } from 'react';
import { FiCopy, FiEdit2, FiTrash2 } from 'react-icons/fi';
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
    <div className="flex items-center justify-between rounded-xl px-5 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
          {item.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
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

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          onClick={() => onEditQuantity(item.id)}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
          aria-label={`Edit quantity for ${item.name}`}
          title="Edit quantity"
        >
          <FiEdit2 size={15} />
        </button>
        <button
          onClick={() => onDuplicate(item.id)}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
          aria-label={`Duplicate ${item.name}`}
          title="Duplicate"
        >
          <FiCopy size={15} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
          aria-label={`Remove ${item.name}`}
          title="Remove"
        >
          <FiTrash2 size={15} />
        </button>
      </div>
    </div>
  );
}
