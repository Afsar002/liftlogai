import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import Skeleton from '../../../shared/components/ui/Skeleton';
import NutritionCard from '../components/NutritionCard';
import MealCard from '../components/MealCard';
import { useMealContext } from '../context/MealContext';
import { useSettings } from '../../settings/hooks/SettingsProvider';
import { useExpertMode } from '../hooks/useExpertMode';
import ExpertNutritionDashboard from '../components/expert/ExpertNutritionDashboard';
import RawFoodMode from '../components/expert/RawFoodMode';
import Card from '../../../shared/components/ui/Card';
import { AnimatedTabIndicator } from '../../../shared/components/motion';
import type { Meal } from '../types';
import { FiPlus, FiX, FiTrendingUp, FiZap, FiBarChart2, FiTarget, FiDroplet, FiAward, FiClock } from 'react-icons/fi';

export default function MealsPage() {
  const { meals, isLoading, error, addCustomMeal, removeFoodFromMeal, duplicateFoodItem } = useMealContext();
  const navigate = useNavigate();
  const { settings, updateExpertMode } = useSettings();
  const expertMode = settings?.expertMode || false;
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(expertMode ? 'dashboard' : 'basic');
  const reduceMotion = useReducedMotion();

  const expert = useExpertMode();

  const handleExpertToggle = () => {
    const newMode = !expertMode;
    updateExpertMode(newMode);
    setActiveTab(newMode ? 'dashboard' : 'basic');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-44" />
          <Skeleton variant="card" className="h-44" />
          <Skeleton variant="card" className="h-28" />
          <Skeleton variant="card" className="h-28" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-6 shadow-sm"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
                  Nutrition
                </span>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
                  Meals
                </h1>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  {expertMode ? 'Expert nutrition tracking & competition prep' : 'Track your daily nutrition'}
                </p>
              </div>

              {/* Expert Mode Toggle */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleExpertToggle}
                  aria-label="Toggle expert mode"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    expertMode ? 'bg-emerald-500' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${
                      expertMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold transition-colors ${expertMode ? 'text-emerald-400' : 'text-white/50'}`}>
                  {expertMode ? 'Expert' : 'Basic'}
                </span>
              </div>
            </div>

            {!expertMode && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/meals/progress')}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-white/20"
                >
                  <FiTrendingUp size={12} aria-hidden="true" />
                  Progress
                </button>
                <motion.button
                  type="button"
                  onClick={() => setShowAddMeal(!showAddMeal)}
                  whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-3.5 py-2 text-[11px] font-extrabold text-emerald-950 shadow-fab"
                >
                  <FiPlus size={12} aria-hidden="true" />
                  Add meal
                </motion.button>
              </div>
            )}
          </div>
        </motion.section>

        {/* Expert Mode Tabs */}
        {expertMode && (
          <div className="flex gap-1 overflow-x-auto hide-scrollbar rounded-full bg-zinc-100 p-1 dark:bg-white/8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 size={16} /> },
              { id: 'foodlog', label: 'Food Log', icon: <FiZap size={16} /> },
              { id: 'goals', label: 'Goal Planner', icon: <FiTarget size={16} /> },
              { id: 'water', label: 'Water', icon: <FiDroplet size={16} /> },
              { id: 'coach', label: 'AI Coach', icon: <FiAward size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-950'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {activeTab === tab.id && <AnimatedTabIndicator layoutId="meals-tab" className="rounded-full" />}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
          >
            {/* Basic Mode Content */}
            {!expertMode && (
              <div className="space-y-6">
                {/* Add Meal Dropdown */}
                {showAddMeal && (
                  <Card>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">Add Custom Meal</p>
                        <button
                          onClick={() => setShowAddMeal(false)}
                          className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/8 dark:hover:text-zinc-300"
                          aria-label="Close add meal"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => (
                          <button
                            key={mealType}
                            onClick={() => {
                              addCustomMeal(mealType as Meal['mealType']);
                              setShowAddMeal(false);
                            }}
                            className="rounded-xl bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:bg-white/5 dark:text-white dark:hover:bg-white/8"
                          >
                            {mealType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <NutritionCard />

                <div className="space-y-4">
                  {meals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onDelete={removeFoodFromMeal}
                      onDuplicate={duplicateFoodItem}
                    />
                  ))}
                </div>

                {meals.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-zinc-500 dark:text-zinc-400">No meals logged today.</p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Click the + button to add a meal.</p>
                  </div>
                )}
              </div>
            )}

            {/* Expert Mode: Dashboard */}
            {expertMode && activeTab === 'dashboard' && (
              <div className="space-y-6">
                <ExpertNutritionDashboard totals={expert.expertTotals} />

                {/* Macro Split */}
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-bold tracking-tight text-zinc-900 dark:text-white">Macronutrient Split</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-red-50 p-3 text-center dark:bg-red-900/20">
                        <p className="text-2xl font-bold text-red-500">{expert.macroSplit.proteinPercent}%</p>
                        <p className="text-xs text-zinc-500">Protein</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                        <p className="text-2xl font-bold text-blue-500">{expert.macroSplit.carbsPercent}%</p>
                        <p className="text-xs text-zinc-500">Carbs</p>
                      </div>
                      <div className="rounded-xl bg-yellow-50 p-3 text-center dark:bg-yellow-900/20">
                        <p className="text-2xl font-bold text-yellow-500">{expert.macroSplit.fatPercent}%</p>
                        <p className="text-xs text-zinc-500">Fat</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Micronutrients */}
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-bold tracking-tight text-zinc-900 dark:text-white">Micronutrients</h3>
                    <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                      {expert.micronutrients.map((m) => (
                        <div key={m.name} className="rounded-xl bg-zinc-50 p-2 dark:bg-white/5">
                          <p className="text-xs font-medium text-zinc-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-zinc-500">
                            {m.current}/{m.target} {m.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Goal Tracking */}
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-bold tracking-tight text-zinc-900 dark:text-white">Goal Tracking</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div><span className="text-xs text-zinc-500">Maintenance</span><p className="font-bold text-emerald-600">{expert.goalTracking.maintenanceCalories}</p></div>
                      <div><span className="text-xs text-zinc-500">Cut</span><p className="font-bold text-red-500">{expert.goalTracking.cutCalories}</p></div>
                      <div><span className="text-xs text-zinc-500">Bulk</span><p className="font-bold text-blue-500">{expert.goalTracking.bulkCalories}</p></div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Expert Mode: Food Log */}
            {expertMode && activeTab === 'foodlog' && (
              <RawFoodMode
                logMode={expert.logMode}
                onLogModeChange={expert.setLogMode}
                onLogFood={expert.logRawFood}
                logs={expert.rawFoodLogs}
                onRemoveLog={expert.removeRawFoodLog}
                favoriteFoods={expert.favoriteFoods}
                recentFoods={expert.recentFoods}
                onToggleFavorite={expert.toggleFavorite}
              />
            )}

            {/* Expert Mode: Water Tracker */}
            {expertMode && activeTab === 'water' && (
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Water Tracker</h2>
                    <Badge variant={expert.expertTotals.waterPercentage >= 100 ? 'success' : 'default'}>
                      {expert.expertTotals.waterPercentage}%
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-extrabold tabular-nums tracking-tight text-blue-500">{expert.waterIntake}ml</p>
                      <p className="text-sm text-zinc-500">of {expert.expertTotals.waterGoal}ml goal</p>
                    </div>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/8">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, expert.expertTotals.waterPercentage)}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[250, 500, 750].map((amount) => (
                      <Button key={amount} variant="secondary" size="sm" onClick={() => expert.addWater(amount)}>
                        +{amount}ml
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" onClick={expert.resetWater}>
                      Reset
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Expert Mode: AI Coach */}
            {expertMode && activeTab === 'coach' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">AI Coach</h2>
                  <Badge variant="info" size="sm">Expert Mode</Badge>
                </div>
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Today's Coaching</h3>
                    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {expert.aiCoachSummary}
                    </p>
                  </div>
                </Card>
                <div className="space-y-3">
                  {expert.aiCoachRecommendations.map((rec, i) => (
                    <Card key={i}>
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-lg dark:bg-white/8">{rec.icon}</span>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant={rec.priority === 1 ? 'danger' : rec.priority === 2 ? 'warning' : 'info'} size="sm">
                              Priority {rec.priority}
                            </Badge>
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{rec.category}</span>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{rec.message}</p>
                          {rec.suggestion && (
                            <p className="mt-1 text-xs italic text-zinc-500">💡 {rec.suggestion}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Expert Mode: Goal Planner */}
            {expertMode && activeTab === 'goals' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Goal Planner</h2>
                  <Badge variant="info" size="sm">Expert Mode</Badge>
                </div>

                {/* Editable Goals */}
                <Card>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Daily Targets</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <GoalInput label="Calories (kcal)" value={expert.goals.calories} onChange={(v) => expert.setGoals({...expert.goals, calories: v})} />
                      <GoalInput label="Protein (g)" value={expert.goals.protein} onChange={(v) => expert.setGoals({...expert.goals, protein: v})} />
                      <GoalInput label="Carbs (g)" value={expert.goals.carbs} onChange={(v) => expert.setGoals({...expert.goals, carbs: v})} />
                      <GoalInput label="Fat (g)" value={expert.goals.fat} onChange={(v) => expert.setGoals({...expert.goals, fat: v})} />
                      <GoalInput label="Fiber (g)" value={expert.goals.fiber} onChange={(v) => expert.setGoals({...expert.goals, fiber: v})} />
                      <GoalInput label="Water (ml)" value={expert.goals.water} onChange={(v) => expert.setGoals({...expert.goals, water: v})} />
                    </div>
                  </div>
                </Card>

                {/* Goal Presets */}
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Quick Presets</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <Button variant="secondary" size="sm" onClick={() => expert.setGoals({...expert.goals, calories: 2000, protein: 150, carbs: 200, fat: 65})}>
                        Weight Loss
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => expert.setGoals({...expert.goals, calories: 2500, protein: 180, carbs: 300, fat: 70})}>
                        Maintenance
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => expert.setGoals({...expert.goals, calories: 3000, protein: 200, carbs: 350, fat: 80})}>
                        Lean Bulk
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => expert.setGoals({...expert.goals, calories: 3500, protein: 220, carbs: 400, fat: 90})}>
                        Aggressive Bulk
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Goal Tracking Display */}
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Progress</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-emerald-500/10 p-3">
                        <span className="text-xs text-zinc-500">Maintenance</span>
                        <p className="text-lg font-bold text-emerald-600">{expert.goalTracking.maintenanceCalories} kcal</p>
                      </div>
                      <div className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                        <span className="text-xs text-zinc-500">Cut</span>
                        <p className="text-lg font-bold text-red-500">{expert.goalTracking.cutCalories} kcal</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                        <span className="text-xs text-zinc-500">Bulk</span>
                        <p className="text-lg font-bold text-blue-500">{expert.goalTracking.bulkCalories} kcal</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function GoalInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="mt-1 w-full rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-900 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}
