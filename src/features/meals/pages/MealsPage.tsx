import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import CompetitionPrepCalculator from '../components/expert/CompetitionPrepCalculator';
import Card from '../../../shared/components/ui/Card';
import type { Meal } from '../types';
import { FiPlus, FiX, FiTrendingUp, FiZap, FiBarChart2, FiTarget, FiDroplet, FiAward, FiClock } from 'react-icons/fi';

export default function MealsPage() {
  const { meals, isLoading, error, addCustomMeal, removeFoodFromMeal, duplicateFoodItem } = useMealContext();
  const navigate = useNavigate();
  const { settings, updateExpertMode } = useSettings();
  const expertMode = settings?.expertMode || false;
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(expertMode ? 'dashboard' : 'basic');

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
          <div className="flex items-center justify-between">
            <div>
              <Skeleton variant="text" className="h-8 w-32" />
              <Skeleton variant="text" className="h-4 w-48 mt-2" />
            </div>
          </div>
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Meals</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {expertMode ? 'Expert nutrition tracking & competition prep' : 'Track your daily nutrition'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Expert Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpertToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                  expertMode ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ${
                    expertMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-xs font-medium transition-colors ${expertMode ? 'text-green-500' : 'text-zinc-400'}`}>
                {expertMode ? 'Expert' : 'Basic'}
              </span>
            </div>
            {!expertMode && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<FiTrendingUp size={16} />}
                  onClick={() => navigate('/meals/progress')}
                >
                  Progress
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FiPlus size={16} />}
                  onClick={() => setShowAddMeal(!showAddMeal)}
                />
              </>
            )}
          </div>
        </div>

        {/* Expert Mode Tabs */}
        {expertMode && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 size={16} /> },
              { id: 'foodlog', label: 'Food Log', icon: <FiZap size={16} /> },
              { id: 'goals', label: 'Goal Planner', icon: <FiTarget size={16} /> },
              { id: 'water', label: 'Water', icon: <FiDroplet size={16} /> },
              { id: 'coach', label: 'AI Coach', icon: <FiTarget size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {/* Basic Mode Content */}
            {!expertMode && (
              <div className="space-y-6">
                {/* Add Meal Dropdown */}
                {showAddMeal && (
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">Add Custom Meal</p>
                      <button
                        onClick={() => setShowAddMeal(false)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
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
                          className="px-3 py-2 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors border border-zinc-200 dark:border-zinc-600"
                        >
                          {mealType}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Macronutrient Split</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-500">{expert.macroSplit.proteinPercent}%</p>
                        <p className="text-xs text-zinc-500">Protein</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-500">{expert.macroSplit.carbsPercent}%</p>
                        <p className="text-xs text-zinc-500">Carbs</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-500">{expert.macroSplit.fatPercent}%</p>
                        <p className="text-xs text-zinc-500">Fat</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Micronutrients */}
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Micronutrients</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-48 overflow-y-auto">
                      {expert.micronutrients.map((m) => (
                        <div key={m.name} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
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
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Goal Tracking</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div><span className="text-xs text-zinc-500">Maintenance</span><p className="font-bold text-green-600">{expert.goalTracking.maintenanceCalories}</p></div>
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
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Water Tracker</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-500">{expert.waterIntake}ml</p>
                      <p className="text-sm text-zinc-500">of {expert.expertTotals.waterGoal}ml goal</p>
                    </div>
                    <Badge variant={expert.expertTotals.waterPercentage >= 100 ? 'success' : 'info'}>
                      {expert.expertTotals.waterPercentage}%
                    </Badge>
                  </div>
                  <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, expert.expertTotals.waterPercentage)}%` }} />
                  </div>
                  <div className="flex gap-2">
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
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">AI Coach</h2>
                <Card>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Today's Coaching</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {expert.aiCoachSummary}
                    </p>
                  </div>
                </Card>
                <div className="space-y-3">
                  {expert.aiCoachRecommendations.map((rec, i) => (
                    <Card key={i}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{rec.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={rec.priority === 1 ? 'danger' : rec.priority === 2 ? 'warning' : 'info'} size="sm">
                              Priority {rec.priority}
                            </Badge>
                            <span className="text-xs font-medium text-zinc-500 uppercase">{rec.category}</span>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{rec.message}</p>
                          {rec.suggestion && (
                            <p className="text-xs text-zinc-500 mt-1 italic">💡 {rec.suggestion}</p>
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
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Goal Planner</h2>
                
                {/* Editable Goals */}
                <Card>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Daily Targets</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Calories (kcal)</label>
                        <input type="number" value={expert.goals.calories} onChange={(e) => expert.setGoals({...expert.goals, calories: parseInt(e.target.value) || 0})}
                          className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Protein (g)</label>
                        <input type="number" value={expert.goals.protein} onChange={(e) => expert.setGoals({...expert.goals, protein: parseInt(e.target.value) || 0})}
                          className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Carbs (g)</label>
                        <input type="number" value={expert.goals.carbs} onChange={(e) => expert.setGoals({...expert.goals, carbs: parseInt(e.target.value) || 0})}
                          className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Fat (g)</label>
                        <input type="number" value={expert.goals.fat} onChange={(e) => expert.setGoals({...expert.goals, fat: parseInt(e.target.value) || 0})}
                          className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Fiber (g)</label>
                        <input type="number" value={expert.goals.fiber} onChange={(e) => expert.setGoals({...expert.goals, fiber: parseInt(e.target.value) || 0})}
                          className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500">Water (ml)</label>
                        <input type="number" value={expert.goals.water} onChange={(e) => expert.setGoals({...expert.goals, water: parseInt(e.target.value) || 0})}
                          className="w-full mt-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm" />
                      </div>
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
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-xs text-zinc-500">Maintenance</span>
                        <p className="font-bold text-lg text-green-600">{expert.goalTracking.maintenanceCalories} kcal</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <span className="text-xs text-zinc-500">Cut</span>
                        <p className="font-bold text-lg text-red-500">{expert.goalTracking.cutCalories} kcal</p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-xs text-zinc-500">Bulk</span>
                        <p className="font-bold text-lg text-blue-500">{expert.goalTracking.bulkCalories} kcal</p>
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