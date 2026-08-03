import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi';
import Layout from '../../../shared/components/layout/Layout';
import Card from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { AnimatedPage } from '../../../shared/components/motion';
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
      <AnimatedPage>
      <div className="space-y-5">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-5 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/meals')}
                aria-label="Back to meals"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              >
                <FiArrowLeft size={14} aria-hidden="true" />
              </button>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
                Add to meal
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
              Search food
            </h1>
            <p className="mt-1 text-xs font-semibold text-white/60">
              Find a food to add, or create your own.
            </p>
          </div>
        </section>

        {/* Search Input */}
        <div className="relative">
          <FiSearch
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200/80 bg-white py-3 pl-11 pr-10 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 dark:border-white/10 dark:bg-[#141417] dark:text-white dark:placeholder:text-zinc-500"
            placeholder="Search for a food..."
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:hover:text-white"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <Card padding="none" className="overflow-hidden">
            <p className="border-b border-zinc-100 bg-zinc-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-white/6 dark:bg-white/5 dark:text-zinc-400">
              {results.length} food{results.length !== 1 ? 's' : ''} found
            </p>
            {results.map((food) => (
              <FoodSearchItem
                key={food.id}
                food={food}
                onSelect={handleSelectFood}
              />
            ))}
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && query && results.length === 0 && !error && (
          <div className="py-8 text-center">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              No foods found. Try a different search term or create a custom food.
            </p>
            <Button variant="secondary" onClick={handleCreateCustom}>
              Create Custom Food
            </Button>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !query && (
          <div className="rounded-3xl border border-dashed border-zinc-300 py-12 text-center dark:border-white/10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FiSearch size={24} aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
              Search for a food to add to your meal
            </p>
          </div>
        )}
      </div>
      </AnimatedPage>
    </Layout>
  );
}
