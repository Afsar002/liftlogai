import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../shared/components/layout/Layout';
import { useFoodSearch } from '../hooks/useFoodSearch';
import { useMealContext } from '../context/MealContext';
import FoodSearchItem from '../components/FoodSearchItem';
import type { FoodSearchResult } from '../types';

export default function FoodSearchPage() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const { query, setQuery, results, isLoading, error, clearSearch } = useFoodSearch();
  const { addFoodToMeal } = useMealContext();

  const handleSelectFood = async (food: FoodSearchResult) => {
    if (!mealId) return;
    await addFoodToMeal(mealId, food);
    navigate('/meals');
  };

  const handleCreateCustom = () => {
    const name = prompt('Enter food name:');
    if (!name) return;

    const calories = parseFloat(prompt('Calories per serving:') || '0');
    const protein = parseFloat(prompt('Protein (g):') || '0');
    const carbs = parseFloat(prompt('Carbs (g):') || '0');
    const fat = parseFloat(prompt('Fat (g):') || '0');

    const customFood: FoodSearchResult = {
      id: `custom-${Date.now()}`,
      name,
      calories,
      protein,
      carbs,
      fat,
      servingSize: 100,
      servingUnit: 'g',
      source: 'custom',
    };

    if (mealId) {
      addFoodToMeal(mealId, customFood);
      navigate('/meals');
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/meals')}
            className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Search Food</h1>
        </div>

        {/* Search Input */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Search for a food..."
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <p className="px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              {results.length} food{results.length !== 1 ? 's' : ''} found
            </p>
            {results.map((food) => (
              <FoodSearchItem
                key={food.id}
                food={food}
                onSelect={handleSelectFood}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && query && results.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              No foods found. Try a different search term or create a custom food.
            </p>
            <button
              onClick={handleCreateCustom}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Create Custom Food
            </button>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !query && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Search for a food to add to your meal
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}