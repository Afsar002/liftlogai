import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import type { Meal } from '../types';
import { NutritionService } from '../services/NutritionService';
import MealItemRow from './MealItemRow';
import { useMealContext } from '../context/MealContext';
import { useSettings } from '../../settings/hooks/SettingsProvider';
import Card from '../../../shared/components/ui/Card';

interface MealCardProps {
  meal: Meal;
  onDelete: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
}

export default function MealCard({ meal, onDelete, onDuplicate }: MealCardProps) {
  const navigate = useNavigate();
  const { updateItemQuantity } = useMealContext();
  const { settings } = useSettings();
  const expertMode = settings?.expertMode || false;

  const totalCalories = useMemo(
    () => NutritionService.calculateTotals([meal]).calories,
    [meal.items]
  );

  // Force re-render when meal.items changes
  const itemCount = meal.items.length;

  const handleEditQuantity = (itemId: string) => {
    const item = meal.items.find((i) => i.id === itemId);
    if (!item) return;

    const input = prompt(
      `Enter new quantity for ${item.name} (${item.servingSize} ${item.servingUnit} default):`,
      item.quantity.toString()
    );
    if (input) {
      const qty = parseFloat(input);
      if (!isNaN(qty) && qty > 0) {
        updateItemQuantity(itemId, qty);
      }
    }
  };

  const handleAddFood = () => {
    navigate(`/meals/search/${meal.id}`);
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-white/6">
        <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
          {meal.mealType}
        </h3>
        <span className="text-sm font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
          {totalCalories} kcal
        </span>
      </div>

      {/* Items */}
      <div className="py-1">
        {meal.items.length === 0 ? (
          <p className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
            No food logged yet
          </p>
        ) : (
          meal.items.map((item) => (
            <MealItemRow
              key={item.id}
              item={item}
              onEditQuantity={handleEditQuantity}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))
        )}
      </div>

      {/* Add Food Button */}
      <button
        onClick={handleAddFood}
        className="flex w-full items-center justify-center gap-2 rounded-b-2xl border-t border-zinc-100 px-4 py-3 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/5 hover:text-emerald-500 dark:border-white/6 dark:text-emerald-400"
      >
        <FiPlus size={16} aria-hidden="true" />
        Add Food
      </button>
    </Card>
  );
}
