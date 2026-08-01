import { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Badge from '../../../../shared/components/ui/Badge';
import { allFoods, searchFoods, getFoodsByCategory } from '../../data/foodDatabase';
import { createOnlineFoodProvider } from '../../services/OnlineFoodProvider';
import { NutritionEngine } from '../../services/NutritionEngine';
import type { RawFoodEntry, LogMode, RawFoodLog, FoodCategory, FoodServing, FoodPreparation } from '../../types/expert';

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

const CATEGORIES: { key: FoodCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🔍' },
  { key: 'protein', label: 'Protein', icon: '🥩' },
  { key: 'carbs', label: 'Carbs', icon: '🌾' },
  { key: 'fats', label: 'Fats', icon: '🥑' },
  { key: 'vegetables', label: 'Veggies', icon: '🥦' },
  { key: 'fruit', label: 'Fruit', icon: '🍎' },
  { key: 'supplements', label: 'Supplements', icon: '💊' },
];

const COMMON_SERVING_NAMES: Record<string, string> = {
  'whole_eggs': '1 Egg',
  'egg_whites': '1 White',
  'bread_white': '1 Slice',
  'banana': '1 Medium',
  'apple': '1 Whole',
  'milk_whole': '1 Cup',
  'peanut_butter': '1 tbsp',
  'raw_oats': '½ Cup',
  'paneer_tikka': '1 Cube',
};

// Foods that should default to serving-first UI
const SERVING_FIRST_FOODS: string[] = [
  'whole_eggs', 'egg_whites', 'egg_yolk',
  'bread_white', 'bread_whole',
  'banana', 'apple', 'orange', 'blueberries',
  'milk_whole',
  'peanut_butter',
  'raw_oats',
  'paneer_tikka', 'paneer',
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
  const [selectedServingId, setSelectedServingId] = useState<string>('');
  const [selectedPreparationId, setSelectedPreparationId] = useState<string>('');
  const [inputMode, setInputMode] = useState<'serving' | 'grams'>('grams');
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);

  const quantityRef = useRef<HTMLInputElement>(null);

  // Derive local foods
  const localFoods = useMemo(() => {
    if (search) return searchFoods(search);
    if (selectedCategory === 'all') return allFoods;
    return getFoodsByCategory(selectedCategory);
  }, [search, selectedCategory]);

  const foods = useMemo(() => {
    if (showOnlineResults && onlineResults.length > 0) {
      return onlineResults.map((food: any) => ({
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

  // Get effective food based on selected preparation
  const effectiveFood = useMemo<RawFoodEntry | null>(() => {
    if (!selectedFood) return null;
    const prep = selectedFood.preparations?.find(p => p.id === selectedPreparationId) || selectedFood.preparations?.find(p => p.isDefault) || null;
    if (!prep) return selectedFood;
    return {
      ...selectedFood,
      nutritionPer100g: prep.nutritionPer100g,
      cookedConversionFactor: prep.conversionFactor,
    };
  }, [selectedFood, selectedPreparationId]);

  // Get servings list with smart default
  const servings = useMemo<FoodServing[]>(() => {
    if (!selectedFood?.servings || selectedFood.servings.length === 0) {
      return [{ id: 'gram', name: 'Grams', grams: selectedFood?.defaultServing || 100, isDefault: true }];
    }
    return selectedFood.servings;
  }, [selectedFood]);

  // Initialize food selection with proper state synchronization
  const initializeFoodSelection = (food: RawFoodEntry) => {
    const shouldUseServingFirst = SERVING_FIRST_FOODS.includes(food.id);
    const mode = shouldUseServingFirst ? 'serving' : 'grams';
    setInputMode(mode);

    if (mode === 'serving' && food.servings && food.servings.length > 0) {
      const defaultServing = food.servings.find(s => s.isDefault) || food.servings[0];
      setSelectedServingId(defaultServing.id);
      setWeight(String(defaultServing.grams));
    } else {
      // Gram mode: select the "gram" serving and use defaultServing weight
      const gramServing = food.servings?.find(s => s.id === 'gram') || { id: 'gram', name: 'Grams', grams: food.defaultServing || 100, isDefault: true };
      setSelectedServingId(gramServing.id);
      setWeight(String(food.defaultServing || 100));
    }

    setSelectedPreparationId('');
    setIsSearchCollapsed(true);
    setShowOnlineResults(false);
  };

  // Auto-select default preparation when food or preparation changes
  useEffect(() => {
    if (selectedFood?.preparations && selectedFood.preparations.length > 0 && !selectedPreparationId) {
      const defaultPrep = selectedFood.preparations.find(p => p.isDefault) || selectedFood.preparations[0];
      setSelectedPreparationId(defaultPrep.id);
    }
  }, [selectedFood, selectedPreparationId]);

  // Calculate nutrition preview
  const nutrition = useMemo(() => {
    if (!effectiveFood?.nutritionPer100g || !weight) return null;
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return null;
    // In serving mode, convert quantity to equivalent grams
    const grams = inputMode === 'serving'
      ? (() => {
          const serving = servings.find(s => s.id === selectedServingId);
          if (!serving) return w;
          // For gram unit types, the weight IS the grams
          if (serving.id === 'gram' || serving.id === 'raw_gram' || serving.id === 'cooked_gram') {
            return w;
          }
          // For natural units (eggs, slices, cups), multiply by serving grams
          return serving.grams * w;
        })()
      : w;
    return NutritionEngine.calculateNutritionPreview(effectiveFood, grams, logMode);
  }, [effectiveFood, weight, logMode, inputMode, servings, selectedServingId]);

  // Dynamic nutrition label
  const nutritionLabel = useMemo(() => {
    if (!selectedFood) return 'Per 100g';
    if (inputMode === 'grams') return 'Per 100g';
    const serving = servings.find(s => s.id === selectedServingId);
    if (serving) {
      if (serving.id === 'raw_gram') return 'Weight (Raw)';
      if (serving.id === 'cooked_gram') return 'Weight (Cooked)';
      if (serving.id === 'gram') return 'Per 100g';
      return `Per ${serving.name}`;
    }
    return 'Per 100g';
  }, [selectedFood, inputMode, servings, selectedServingId]);

  // Equivalent weight display
  const equivalentWeight = useMemo(() => {
    if (!selectedFood || inputMode === 'grams') return null;
    const serving = servings.find(s => s.id === selectedServingId);
    if (!serving) return null;
    // For "Raw grams" and "Cooked grams" unit types, just show the entered weight
    if (serving.id === 'gram' || serving.id === 'raw_gram' || serving.id === 'cooked_gram') {
      return Math.round(parseFloat(weight) || 0);
    }
    const qty = parseFloat(weight) || 0;
    return Math.round(serving.grams * qty);
  }, [selectedFood, inputMode, servings, selectedServingId, weight]);

  // Micronutrient rows
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

  // Auto-focus quantity when food selected
  useEffect(() => {
    if (selectedFood && quantityRef.current) {
      quantityRef.current.focus();
      quantityRef.current.select();
    }
  }, [selectedFood, selectedServingId, selectedPreparationId]);

  const handleSelectFood = (food: RawFoodEntry) => {
    setSelectedFood(food);
    initializeFoodSelection(food);
  };

  const handleChangeFood = () => {
    setSelectedFood(null);
    setWeight('100');
    setSelectedServingId('');
    setSelectedPreparationId('');
    setInputMode('grams');
    setIsSearchCollapsed(false);
  };

const handleLog = async () => {
  if (!effectiveFood || !weight) return;

  const w = parseFloat(weight);
  if (isNaN(w) || w <= 0) return;

  const grams =
    inputMode === "serving"
      ? (() => {
          const serving = servings.find(s => s.id === selectedServingId);
          if (!serving) return w;

          if (
            serving.id === "gram" ||
            serving.id === "raw_gram" ||
            serving.id === "cooked_gram"
          ) {
            return w;
          }

          return serving.grams * w;
        })()
      : w;

  try {
    await Promise.resolve(
      onLogFood(effectiveFood, grams, logMode, mealId)
    );

    // Close panel and reset transient state
    handleChangeFood();

  } catch (err) {
    console.error("Failed to log food:", err);
  }
 };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLog();
    }
  };

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

  const getThumbnail = (food: RawFoodEntry) => {
    if (food.thumbnail) return food.thumbnail;
    const categoryEmojis: Record<string, string> = {
      protein: '🥩',
      carbs: '🌾',
      fats: '🥑',
      vegetables: '🥦',
      fruit: '🍎',
      supplements: '💊',
    };
    return categoryEmojis[food.category] || '🍽️';
  };

  const getCommonServingName = (food: RawFoodEntry): string => {
    return COMMON_SERVING_NAMES[food.id] || '1 Serving';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Food Log</h2>
        <Badge variant="info" size="sm">Expert Mode</Badge>
      </div>

      {/* Search Section - Collapsible */}
      {!isSearchCollapsed && (
        <Card className="transition-all duration-300 ease-in-out">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchOnline()}
                placeholder="Search foods..."
                autoFocus
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
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => { 
                    setSelectedCategory(cat.key); 
                    setShowOnlineResults(false); 
                  }}
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

            {/* Food List */}
            {foods.length === 0 ? (
              <div className="p-4 text-center text-sm text-zinc-500">
                {showOnlineResults ? 'No results found online. Try a different search term.' : 'No foods found. Try searching online or selecting a category.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {foods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="text-left p-3 rounded-xl border transition-all hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{getThumbnail(food)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{food.name}</span>
                            {favoriteFoods.includes(food.id) && <span className="text-yellow-500 flex-shrink-0">⭐</span>}
                            {recentFoods.includes(food.id) && <Badge variant="info" size="sm">Recent</Badge>}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {food.nutritionPer100g.calories} kcal | P: {food.nutritionPer100g.protein}g | C: {food.nutritionPer100g.carbs}g | F: {food.nutritionPer100g.fat}g
                          </div>
                        </div>
                      </div>
                      {showOnlineResults && onlineResults.length > 0 && (
                        <Badge variant="info" size="sm">Online</Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Change Food Button - shown when search is collapsed */}
      {isSearchCollapsed && (
        <button
          onClick={handleChangeFood}
          className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
        >
          ← Change Food
        </button>
      )}

      {/* Sticky Selected Food Panel */}
      {selectedFood && (
        <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 transition-all duration-300 ease-in-out">
          <div className="space-y-4">
            {/* Food Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getThumbnail(selectedFood)}</span>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{selectedFood.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{nutritionLabel}</p>
                </div>
              </div>
              <button
                onClick={handleChangeFood}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            {/* Preparation Selector */}
            {selectedFood.preparations && selectedFood.preparations.length > 1 && (
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                  Preparation
                </label>
                <select
                  value={selectedPreparationId}
                  onChange={(e) => setSelectedPreparationId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  {selectedFood.preparations.map((prep: FoodPreparation) => (
                    <option key={prep.id} value={prep.id}>{prep.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Serving Selector & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                  {inputMode === 'grams' ? 'Mode' : 'Serving'}
                </label>
                <select
                  value={selectedServingId}
                  onChange={(e) => {
                    setSelectedServingId(e.target.value);
                    const serving = servings.find(s => s.id === e.target.value);
                    if (serving) {
                      setInputMode('serving');
                      setWeight(String(serving.grams));
                    }
                  }}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  {servings.map((serving) => (
                    <option key={serving.id} value={serving.id}>{serving.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                  {inputMode === 'grams' ? 'Weight (g)' : 'Quantity'}
                </label>
                <input
                  ref={quantityRef}
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    if (e.target.value !== '1' && e.target.value !== '0') {
                      setInputMode('serving');
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  min="1"
                  step="1"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {/* Equivalent Weight (only in serving mode, hide for gram unit types) */}
            {inputMode === 'serving' && equivalentWeight !== null && !['gram', 'raw_gram', 'cooked_gram'].includes(selectedServingId) && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Equivalent: <span className="font-semibold">{equivalentWeight}g</span>
              </div>
            )}

            {/* Toggle to Grams - only show when in serving mode */}
            {inputMode === 'serving' && (
              <button
                onClick={() => setInputMode('grams')}
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                Switch to grams
              </button>
            )}

            {/* Meal Selector */}
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                Meal
              </label>
              <select
                value={mealId}
                onChange={(e) => setMealId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="default">General</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>

            {/* Nutrition Preview */}
            {nutrition && (
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg space-y-2">
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
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Micronutrients</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {micronutrientRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">{row.label}</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {row.value.toLocaleString()} {row.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Food Button */}
            <Button 
              className="w-full" 
              onClick={handleLog}
              disabled={!nutrition}
            >
              + Add Food
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