import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Meal } from '../types';
import { NutritionService } from '../services/NutritionService';
import MealItemRow from './MealItemRow';
import { useMealContext } from '../context/MealContext';
import { useSettings } from '../../settings/hooks/SettingsProvider';

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
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          {meal.mealType}
        </h3>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {totalCalories} kcal
        </span>
      </div>

      {/* Items */}
      <div className="py-1">
        {meal.items.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-4">
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-b-xl transition-colors border-t border-zinc-100 dark:border-zinc-800"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Food
      </button>
    </div>
  );
}