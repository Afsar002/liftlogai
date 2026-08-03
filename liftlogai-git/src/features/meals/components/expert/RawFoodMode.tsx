import { useState, useMemo } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Badge from '../../../../shared/components/ui/Badge';
import { allFoods, searchFoods, calculateNutrition, getFoodsByCategory } from '../../data/foodDatabase';
import { createOnlineFoodProvider } from '../../services/OnlineFoodProvider';
import type { RawFoodEntry, LogMode, RawFoodLog, FoodCategory } from '../../types/expert';

interface Props {
  logMode: LogMode;
  onLogModeChange: (mode: LogMode) => void;
  onLogFood: (food: RawFoodEntry, weight: number, mode: LogMode, mealId: string) => void;
  logs: RawFoodLog[];
  onRemoveLog: (id: string) => void;
  favoriteFoods: string[];
  recentFoods: string[];
  onToggleFavorite: (foodId: string) => void;
}

const CATEGORIES: { key: FoodCategory; label: string; icon: string }[] = [
  { key: 'protein', label: 'Protein', icon: '🥩' },
  { key: 'carbs', label: 'Carbs', icon: '🌾' },
  { key: 'fats', label: 'Fats', icon: '🥑' },
  { key: 'vegetables', label: 'Vegetables', icon: '🥦' },
  { key: 'fruit', label: 'Fruit', icon: '🍎' },
  { key: 'supplements', label: 'Supplements', icon: '💊' },
];

export default function RawFoodMode({
  logMode,
  onLogModeChange,
  onLogFood,
  logs,
  onRemoveLog,
  favoriteFoods,
  recentFoods,
  onToggleFavorite,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [selectedFood, setSelectedFood] = useState<RawFoodEntry | null>(null);
  const [weight, setWeight] = useState('100');
  const [mealId, setMealId] = useState('default');
  const [onlineResults, setOnlineResults] = useState<any[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [showOnlineResults, setShowOnlineResults] = useState(false);

  const localFoods = useMemo(() => {
    if (search) return searchFoods(search);
    if (selectedCategory === 'all') return allFoods;
    return getFoodsByCategory(selectedCategory);
  }, [search, selectedCategory]);

  const foods = useMemo(() => {
    if (showOnlineResults && onlineResults.length > 0) {
      return onlineResults.map(food => ({
        id: food.id,
        name: food.name,
        category: 'carbs' as FoodCategory,
        nutritionPer100g: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: 0,
        },
        cookedConversionFactor: 1,
        servingUnit: 'g',
        defaultServing: 100,
      }));
    }
    return localFoods;
  }, [showOnlineResults, onlineResults, localFoods]);

  const nutrition = useMemo(() => {
    if (!selectedFood || !weight) return null;
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return null;
    const actualWeight = logMode === 'cooked' ? w / selectedFood.cookedConversionFactor : w;
    return calculateNutrition(selectedFood, actualWeight);
  }, [selectedFood, weight, logMode]);

  const micronutrientRows = useMemo(() => {
    if (!nutrition) return [];
    const rows: { label: string; value: number; unit: string }[] = [
      { label: 'Vitamin A', value: nutrition.vitaminA, unit: 'mcg' },
      { label: 'Vitamin B6', value: nutrition.vitaminB6, unit: 'mg' },
      { label: 'Vitamin B12', value: nutrition.vitaminB12, unit: 'mcg' },
      { label: 'Vitamin C', value: nutrition.vitaminC, unit: 'mg' },
      { label: 'Vitamin D', value: nutrition.vitaminD, unit: 'mcg' },
      { label: 'Vitamin E', value: nutrition.vitaminE, unit: 'mg' },
      { label: 'Vitamin K', value: nutrition.vitaminK, unit: 'mcg' },
      { label: 'Calcium', value: nutrition.calcium, unit: 'mg' },
      { label: 'Iron', value: nutrition.iron, unit: 'mg' },
      { label: 'Magnesium', value: nutrition.magnesium, unit: 'mg' },
      { label: 'Potassium', value: nutrition.potassium, unit: 'mg' },
      { label: 'Zinc', value: nutrition.zinc, unit: 'mg' },
    ];
    return rows.filter((r) => r.value > 0);
  }, [nutrition]);

  const searchOnline = async () => {
    if (!search.trim()) return;
    
    setIsSearchingOnline(true);
    setShowOnlineResults(true);
    
    try {
      const provider = createOnlineFoodProvider();
      const results = await provider.search(search);
      setOnlineResults(results);
    } catch (error) {
      console.error('Online search failed:', error);
      setOnlineResults([]);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const handleLog = () => {
    if (!selectedFood || !weight) return;
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    onLogFood(selectedFood, w, logMode, mealId);
    setSelectedFood(null);
    setWeight('100');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Food Log</h2>
        <Badge variant="info" size="sm">Expert Mode</Badge>
      </div>

      {/* Log Mode Toggle */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Log Mode:</span>
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <button
              onClick={() => onLogModeChange('raw')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${logMode === 'raw' ? 'bg-green-500 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
            >
              ○ Log Raw
            </button>
            <button
              onClick={() => onLogModeChange('cooked')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${logMode === 'cooked' ? 'bg-green-500 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
            >
              ○ Log Cooked
            </button>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchOnline()}
              placeholder="Search foods..."
              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            <Button 
              variant="secondary" 
              size="sm"
              onClick={searchOnline}
              disabled={isSearchingOnline || !search.trim()}
            >
              {isSearchingOnline ? 'Searching...' : 'Online'}
            </Button>
          </div>

          {/* Info Message */}
          {showOnlineResults && onlineResults.length === 0 && !isSearchingOnline && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                ℹ️ Online search unavailable. Please check your internet connection or try searching your local database by clearing the search.
              </p>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedCategory('all'); setShowOnlineResults(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedCategory === 'all' && !showOnlineResults ? 'bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setSelectedCategory(cat.key); setShowOnlineResults(false); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedCategory === cat.key && !showOnlineResults ? 'bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
            {showOnlineResults && (
              <button
                onClick={() => setShowOnlineResults(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-500 text-white"
              >
                ✕ Clear Search
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Food List */}
      {foods.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500 text-center py-8">
            {showOnlineResults ? 'No results found online. Try a different search term or clear the search to browse your local database.' : 'No foods found. Try searching online or selecting a category.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {foods.map((food) => (
            <button
              key={food.id}
              onClick={() => {
                setSelectedFood(food);
                setWeight(String(food.defaultServing));
              }}
              className={`text-left p-3 rounded-xl border transition-all ${
                selectedFood?.id === food.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{food.name}</span>
                <div className="flex items-center gap-2">
                  {showOnlineResults && onlineResults.length > 0 && (
                    <Badge variant="info" size="sm">Online</Badge>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(food.id); }}
                    className="text-lg"
                  >
                    {favoriteFoods.includes(food.id) ? '⭐' : '☆'}
                  </button>
                </div>
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {food.nutritionPer100g.calories} kcal | P: {food.nutritionPer100g.protein}g | C: {food.nutritionPer100g.carbs}g | F: {food.nutritionPer100g.fat}g
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Weight Input & Nutrition */}
      {selectedFood && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">{selectedFood.name}</h3>
              <Badge variant="default" size="sm">Per 100g</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <span className="text-xs text-zinc-500">Calories</span>
                <p className="font-bold text-zinc-900 dark:text-white">{selectedFood.nutritionPer100g.calories}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Protein</span>
                <p className="font-bold text-zinc-900 dark:text-white">{selectedFood.nutritionPer100g.protein}g</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Carbs</span>
                <p className="font-bold text-zinc-900 dark:text-white">{selectedFood.nutritionPer100g.carbs}g</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Fat</span>
                <p className="font-bold text-zinc-900 dark:text-white">{selectedFood.nutritionPer100g.fat}g</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {logMode === 'raw' ? 'Raw Weight (g)' : 'Cooked Weight (g)'}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="1"
                  className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Meal</label>
                <select
                  value={mealId}
                  onChange={(e) => setMealId(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="default">General</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
            </div>

            {nutrition && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <div>
                    <span className="text-xs text-zinc-500">Calories</span>
                    <p className="font-bold text-green-600 dark:text-green-400">{nutrition.calories}</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Protein</span>
                    <p className="font-bold text-green-600 dark:text-green-400">{nutrition.protein}g</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Carbs</span>
                    <p className="font-bold text-green-600 dark:text-green-400">{nutrition.carbs}g</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Fat</span>
                    <p className="font-bold text-green-600 dark:text-green-400">{nutrition.fat}g</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Fiber</span>
                    <p className="font-bold text-green-600 dark:text-green-400">{nutrition.fiber}g</p>
                  </div>
                </div>
                {micronutrientRows.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1.5">Micronutrients</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {micronutrientRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">{row.label}</span>
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            {row.value.toLocaleString()} {row.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button className="w-full" onClick={handleLog}>
              Log Food
            </Button>
          </div>
        </Card>
      )}

      {/* Logged Foods */}
      {logs.length > 0 && (
        <Card>
          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Today's Food Log</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{log.foodName}</p>
                    <p className="text-xs text-zinc-500">
                      {log.rawWeight}g raw {log.cookedWeight ? `(~${log.cookedWeight}g cooked)` : ''}
                    </p>
                    <div className="flex gap-3 text-xs text-zinc-500 mt-0.5">
                      <span>{log.calories} kcal</span>
                      <span>P: {log.protein}g</span>
                      <span>C: {log.carbs}g</span>
                      <span>F: {log.fat}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveLog(log.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}