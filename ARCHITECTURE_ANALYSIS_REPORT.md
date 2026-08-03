# LiftLog AI - Comprehensive Architecture Analysis Report

**Generated:** 2026-08-01  
**Branch:** `expert-mode-refactor`  
**Latest Commit:** `93dc611 - Changing Log mode`

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Component Tree](#component-tree)
4. [State Management](#state-management)
5. [Services](#services)
6. [Types](#types)
7. [Business Logic](#business-logic)
8. [Dependencies](#dependencies)
9. [Performance Analysis](#performance-analysis)
10. [Code Quality Assessment](#code-quality-assessment)
11. [Improvement Roadmap](#improvement-roadmap)
12. [Development Rules Summary](#development-rules-summary)

---

## 1. Project Overview

### What is LiftLog AI?

LiftLog AI is a **progressive web application (PWA)** for tracking workouts and nutrition, built with React 19, TypeScript, and TailwindCSS. It targets intermediate-to-advanced lifters who want detailed workout logging, nutrition tracking (with an "Expert Mode" for raw ingredient precision), analytics, and AI-driven insights.

### Core Features

| Feature | Description |
|---------|-------------|
| **Workout Logging** | Session-based workout tracking with sets, reps, weight, RIR, rest timers, previous performance comparison |
| **Templates** | Create, edit, duplicate workout templates; start workouts from templates |
| **History** | Workout history with weekly summaries, grouping by date, delete functionality |
| **Analytics** | Volume trends, strength progress (1RM), exercise distribution, workout heatmap, monthly trends, streaks, PRs |
| **Nutrition (Meals)** | Basic meal logging (Breakfast/Lunch/Dinner/Snacks) with food search, calorie/macro tracking |
| **Expert Mode** | Raw ingredient logging with raw↔cooked conversions, micronutrients, meal builder, competition prep calculator, AI coach |
| **AI Features** | AIInsightService (nutrition analysis), AICoachService (holistic coaching: nutrition + workouts + recovery + body composition) |
| **Records (PRs)** | Automatic PR detection on workout completion (Epley formula) |
| **Profile/Settings** | User profile, weight unit, theme, rest timer, notifications, calorie calculation (Mifflin-St Jeor) |
| **Data Export/Import** | Full database backup/restore via JSON |
| **PWA** | Offline-capable, installable, service worker via vite-plugin-pwa |

### Target Audience

- **Primary:** Recreational to competitive bodybuilders/powerlifters
- **Secondary:** General fitness enthusiasts wanting detailed tracking
- **Expert Mode:** Advanced users who weigh raw ingredients and need precision nutrition

---

## 2. Folder Structure

```
src/
├── app/
│   └── App.tsx                    # Route definitions
├── assets/
│   └── icons/                     # SVG icons for muscle groups
├── constants/
│   └── exercise.ts                # Exercise constants
├── database/
│   ├── db.ts                      # Dexie database instance (v7)
│   ├── schema.ts                  # TypeScript interfaces for DB tables
│   └── types.ts                   # Database-specific types
├── features/
│   ├── analytics/
│   │   ├── components/            # Charts, cards, heatmap
│   │   ├── hooks/                 # useAnalytics, useStrengthProgress, etc.
│   │   ├── pages/                 # AnalyticsPage
│   │   ├── services/              # AnalyticsService, AnalyticsRepository
│   │   └── types.ts               # Analytics-specific types
│   ├── dashboard/
│   │   ├── components/            # Stat cards, quick actions, recent workouts
│   │   ├── hooks/                 # useDashboard
│   │   ├── pages/                 # Dashboard
│   │   └── services/              # DashboardRepository
│   ├── data/
│   │   └── services/              # Backup/restore (buildBackup, restoreBackup, exportDatabase, etc.)
│   ├── exercises/
│   │   ├── components/            # ExercisePicker, charts, history
│   │   ├── data/                  # exerciseLibrary (100+ exercises)
│   │   ├── hooks/                 # useExercise
│   │   ├── pages/                 # ExercisePage
│   │   └── services/              # ExerciseRepository, ExerciseLibraryRepository
│   ├── history/
│   │   ├── components/            # HistoryCard, HistoryGroup, WeeklySummary
│   │   ├── hooks/                 # useWorkoutHistory
│   │   ├── models/                # WorkoutHistory model
│   │   ├── pages/                 # HistoryPage, WorkoutDetailPage
│   │   ├── repositories/          # HistoryRepository
│   │   ├── services/              # calculateWeeklySummary, groupHistoryByDate
│   │   ├── types/                 # History types
│   │   └── utils/                 # formatWorkoutTime
│   ├── meals/
│   │   ├── components/            # MealCard, NutritionCard, Expert components
│   │   │   └── expert/            # RawFoodMode, ExpertNutritionDashboard, CompetitionPrepCalculator
│   │   ├── context/               # MealContext + useMealContext hook
│   │   ├── data/                  # foodDatabase, bodybuildingFoods, indianFoods
│   │   ├── hooks/                 # useMeals, useExpertMode, useFoodSearch
│   │   ├── pages/                 # MealsPage, FoodSearchPage, Progress pages
│   │   ├── repository/            # MealsRepository, FoodRepository
│   │   ├── services/              # NutritionEngine, NutritionService, AI services, etc.
│   │   ├── types/                 # Core meal types, expert types, nutrition types
│   │   └── __tests__/             # Unit tests for nutritionCalculator
│   ├── profile/
│   │   ├── components/            # Profile cards
│   │   ├── hooks/                 # useProfile
│   │   ├── pages/                 # ProfilePage
│   │   ├── repository/            # ProfileRepository
│   │   ├── services/              # ProfileService
│   │   └── types.ts
│   ├── records/
│   │   ├── components/            # PRCard, NewPRModal
│   │   ├── hooks/                 # usePersonalRecords
│   │   ├── pages/                 # RecordPage
│   │   ├── services/              # PersonalRecordRepository, PRDetector
│   │   └── types.ts
│   ├── settings/
│   │   ├── constants.ts           # DEFAULT_SETTINGS
│   │   ├── hooks/                 # SettingsProvider + useSettings
│   │   ├── repository/            # SettingsRepository
│   │   ├── services/              # SettingsService
│   │   └── types.ts
│   ├── templates/
│   │   ├── components/            # TemplateList, TemplateCard, TemplateEditor
│   │   ├── hooks/                 # useTemplates
│   │   ├── pages/                 # TemplatesPage, EditTemplatePage
│   │   ├── services/              # TemplateRepository
│   │   └── types/                 # Template types
│   └── workout/
│       ├── components/            # WorkoutHeader, ExerciseCard, SetTable, RestTimer, etc.
│       ├── context/               # WorkoutContext, RestTimerContext
│       ├── data/                  # defaultTemplates
│       ├── hooks/                 # useWorkoutTimer, useRestTimer, useWorkoutStats
│       ├── pages/                 # WorkoutPage
│       ├── services/              # WorkoutRepository, WorkoutSessionFactory
│       └── types/                 # Session types
├── hooks/
│   └── useWorkoutTimer.ts         # Duplicate? (also in workout/hooks)
├── services/
│   └── WorkoutServices.ts         # Legacy? (empty export)
├── shared/
│   ├── components/
│   │   ├── layout/                # Layout, BottomNav
│   │   └── ui/                    # Button, Card, Badge, Skeleton, Dialogs, etc.
│   ├── lib/
│   │   ├── calorieCalculator.ts   # BMR, TDEE, required calories
│   │   ├── cn.ts                  # clsx + tailwind-merge utility
│   │   ├── constants.ts           # Shared constants
│   │   ├── dayjs.ts               # Dayjs configuration
│   │   └── recharts.ts            # Recharts theme/config
│   └── providers/
│       └── ThemeProvider.tsx      # Theme management
├── types/
│   ├── session.ts                 # Workout session types
│   ├── svg.d.ts                   # SVG module declarations
│   └── workout.ts                 # Workout types
├── utils/
│   ├── oneRepMax.ts               # Epley formula
│   └── workout.ts                 # Workout utilities
├── index.css                      # TailwindCSS imports + global styles
├── main.tsx                       # App entry point with providers
└── vite-env.d.ts                  # Vite type declarations
```

---

## 3. Component Tree

```
App (Routes)
├── Layout (all pages)
│   ├── Main content area
│   └── BottomNav (5 tabs: Dashboard, Workout, Analytics, Meals, Profile)
│
├── Dashboard (/)
│   ├── GreetingCard
│   ├── WorkoutCard (last workout)
│   ├── StatCards (4): Streak, Avg Duration, Total Volume, This Week
│   ├── NutritionCard (from meals feature)
│   ├── DashboardTemplates (quick template start)
│   ├── DashboardRecentWorkouts
│   ├── GoalCard
│   └── DashboardQuickActions
│
├── WorkoutPage (/workout)
│   ├── WorkoutHeader (title + timer)
│   ├── ExerciseCard[] (per exercise)
│   │   ├── ExerciseHeader (name + link to ExercisePage)
│   │   ├── PreviousPerformance
│   │   ├── SetTable
│   │   │   ├── SetHeader
│   │   │   └── SetRow[] (EditableCell for weight/reps/RIR)
│   │   └── AddSetButton
│   ├── Add Exercise Button → ExercisePickerModal
│   ├── RestTimer (when active)
│   └── FinishWorkoutButton → WorkoutSummary (with PR detection)
│
├── AnalyticsPage (/analytics)
│   ├── MetricCards (8): Workouts, Volume, Sets, Time, Avg, Streak, PRs, Fav Exercise
│   ├── WeeklyVolumeChart + AreaTrends
│   ├── DonutChart (exercise distribution)
│   ├── StrengthProgress (exercise selector + chart)
│   ├── WorkoutHeatmap (84 days)
│   └── MonthlyTrends
│
├── HistoryPage (/history)
│   ├── WeeklySummary
│   └── HistoryGroup[] (grouped by date)
│       └── HistoryCard[] (workout summary + delete)
│   └── WorkoutDetailPage (/history/:id)
│
├── ProfilePage (/profile)
│   ├── UserProfileCard
│   ├── StatsCard
│   ├── SettingsCard
│   ├── DataCard (export/import)
│   └── AboutCard
│
├── Exercises
│   ├── ExercisePage (/exercise/:name)
│   │   ├── ExerciseHeader
│   │   ├── PRCard
│   │   ├── ExerciseHistory
│   │   └── StrengthChart
│   └── ExercisePickerModal (reused in WorkoutPage, Templates)
│
├── Templates
│   ├── TemplatesPage (/templates)
│   │   └── TemplateList
│   │       └── TemplateCard (start, edit, duplicate, delete)
│   └── EditTemplatePage (/templates/:id)
│       └── TemplateEditor
│           └── ExerciseRow[] (with ExercisePicker)
│
├── Records (/records)
│   └── RecordPage
│       └── PRCard[]
│
├── Meals (/meals)
│   ├── Basic Mode (default)
│   │   ├── NutritionCard
│   │   ├── Add Meal dropdown
│   │   └── MealCard[] (per meal type)
│   │       └── MealItemRow[] (with delete/duplicate)
│   │   └── FoodSearchPage (/meals/search/:mealId)
│   └── Expert Mode (tabs)
│       ├── Dashboard tab: ExpertNutritionDashboard + Macro Split + Micronutrients + Goal Tracking
│       ├── Food Log tab: RawFoodMode (raw/cooked logging with conversion)
│       ├── Water tab: Water tracker
│       ├── Coach tab: AI Coach recommendations
│       └── Goals tab: Editable macro targets + presets
│   ├── ProgressHistoryPage (/meals/progress)
│   └── ProgressDetailPage (/progress/:date)
│
└── Settings (embedded in ProfilePage via SettingsCard)
    ├── Theme, Weight Unit, Rest Timer, Notifications
    └── Profile: Age, Gender, Height, Weight, Activity, Goal, Target Weight
```

---

## 4. State Management

### Provider Hierarchy (from `main.tsx`)

```
BrowserRouter
└── WorkoutProvider          # Active workout session (localStorage + cross-tab sync)
    └── SettingsProvider     # User settings (Dexie + profile for calorie calc)
        └── RestTimerProvider # Rest timer state (localStorage, survives refresh)
            └── ThemeProvider # Theme (light/dark/system, applies to document)
                └── MealProvider  # Meals context (wraps useMeals hook)
                    └── App
```

### State Categories

| Category | Storage | Persistence | Sync |
|----------|---------|-------------|------|
| **Active Workout** | React State + localStorage | Session survives refresh | Cross-tab via `storage` event |
| **Rest Timer** | React State + localStorage | Survives refresh | Cross-tab via `storage` event |
| **User Settings** | Dexie (IndexedDB) | Permanent | Reactive via SettingsProvider.refresh() |
| **Meals (Basic)** | Dexie + React State | Permanent | Refetch via useMeals.loadMeals() |
| **Expert Mode** | React State + localStorage | Session + goals persisted | Local only |
| **Theme** | React State + DOM class | Settings in Dexie | Applied to `document.documentElement` |
| **Workout History** | Dexie | Permanent | Refetch on mount |
| **Templates** | Dexie | Permanent | Refetch on mount |

### Key Patterns

1. **Context + Custom Hook Pattern**: Every provider exports a `useXxx()` hook that throws if used outside provider
2. **Optimistic UI Updates**: Meal actions (delete, duplicate) update React state immediately, persist to DB in background
3. **Cross-Tab Sync**: Workout and RestTimer contexts listen to `storage` events
4. **BeforeUnload Warning**: WorkoutContext warns if closing tab with active session
5. **Derived State**: `useMemo` for computed values (totals, percentages, macro splits)

---

## 5. Services

### Database Layer (Dexie v7)

**Tables:**
- `workoutSessions` - Completed workouts with full exercise/set data
- `personalRecords` - PRs per exercise (Epley 1RM)
- `templates` - Workout templates
- `exercises` - Custom user exercises
- `history` - Denormalized workout history for analytics
- `settings` - Single row (id=1) with all user settings
- `meals`, `mealItems` - Basic meal logging
- `foodCache`, `favoriteFoods` - Food search caching
- `dailyCalorieGoal` - Single row (id=1) manual calorie goal
- `nutritionProgress` - Daily nutrition snapshots

### Feature Services

| Service | Responsibility | Key Methods |
|---------|---------------|-------------|
| **WorkoutRepository** | CRUD for workout sessions | `saveWorkout`, `getWorkoutHistory`, `getWorkout`, `deleteWorkout` |
| **WorkoutSessionFactory** | Create session from template | `create(template)` |
| **TemplateRepository** | CRUD for templates + seeding | `getAll`, `seedDefaults`, `create`, `update`, `delete`, `duplicate` |
| **HistoryRepository** | CRUD + aggregations | `save`, `getAll`, `getById`, `totalVolume`, `totalTrainingMinutes` |
| **AnalyticsService** | Business logic for analytics | `getSummary`, `getWeeklyVolume`, `getStrengthProgress`, `getWorkoutHeatmap`, `getMonthlyTrends`, `getExerciseDistribution` |
| **AnalyticsRepository** | Data access for analytics | `getWorkoutHistory`, `getPersonalRecords` |
| **SettingsService** | Settings + profile management | `getSettings`, `updateProfile`, `updateWeightUnit`, `updateTheme`, etc. |
| **SettingsRepository** | Low-level settings CRUD | `getSettings`, `saveSettings`, `update` |
| **MealsRepository** | Meals, items, food cache, favorites, progress | `getMealsForDate`, `saveMeal`, `addFoodToMeal`, `ensureTodayMeals`, `getCalorieGoal`, `saveProgress` |
| **NutritionService** | Basic nutrition calculations | `calculateTotals`, `calculateRemainingCalories`, `getCalorieGoal`, `recordDailyProgress`, `createMealItemFromSearchResult` |
| **NutritionEngine** | **Single source of truth** for ALL nutrition math | `calculateFoodNutrition`, `calculateRawFoodNutrition`, `calculateMealNutrition`, `calculateMacroTargets`, `calculateCompetitionPrep`, `calculateAdaptiveCalories`, `calculateWorkoutNutrition`, `generateInsights` |
| **nutritionCalculator** | Pure math (no framework deps) | `calculateNutrition`, `scaleNutrition`, `sumNutrition`, `resolveRawWeight`, `rawToCooked`, `cookedToRaw` |
| **AIInsightService** | Nutrition-only insights | `generateInsights`, `getDailySummary` |
| **AICoachService** | Holistic coaching (nutrition + workouts + recovery) | `generateCoaching`, `getCoachSummary`, `calculateWeeklyWeightChange`, `inferWorkoutType` |
| **NutritionDayService** | Daily nutrition aggregation | `buildNutritionDay`, `calculateDailyTotals`, `getTimeline`, `calculateMicronutrients` |
| **ExerciseRepository** | Exercise history, PRs, progress | `getExerciseHistory`, `getPersonalRecord`, `getProgress` |
| **ExerciseLibraryRepository** | Built-in + custom exercise library | `getAll`, `getById`, `create` |
| **PersonalRecordRepository** | PR CRUD | `getByExercise`, `save`, `update` |
| **PRDetector** | Detect PRs on workout finish | `detectPRs(exercises)` |
| **DashboardRepository** | Dashboard stats aggregation | `getDashboardStats` |
| **ProfileService/Repository** | Profile data access | `getTemplates` (legacy?) |

---

## 6. Types

### Core Domain Types

**Workout Session (`features/workout/types/session.ts`):**
```typescript
interface LoggedSet { id, weight, reps, rir, completed }
interface LoggedExercise { id, exerciseId, name, previous?, sets: LoggedSet[] }
interface WorkoutSession { id, workoutName, startedAt: Date, exercises: LoggedExercise[] }
```

**Database Types (`database/types.ts`):**
```typescript
interface WorkoutSessionDB { id?, workoutName, startedAt, finishedAt, duration, exercises, totalSets, completedSets, totalVolume }
interface PersonalRecordDB { id?, exerciseId, exerciseName, weight, reps, estimated1RM, achievedAt }
interface WorkoutTemplateDB { id?, name, exercises: TemplateExercise[], createdAt, updatedAt }
interface ExerciseDB { id, name, muscle?, equipment?, createdAt? }
```

**Meal Types (`features/meals/types/index.ts`):**
```typescript
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
interface MealItem { id, mealId, foodId, name, quantity, servingSize, servingUnit, calories, protein, carbs, fat }
interface Meal { id, date, mealType, items: MealItem[] }
interface NutritionTotals { calories, protein, carbs, fat, mealsLogged }
interface FoodSearchResult { id, name, calories, protein, carbs, fat, servingSize, servingUnit, source }
interface NutritionProgress { id (date), date, caloriesConsumed, calorieGoal, protein, carbs, fat, mealsLogged, recordedAt }
```

**Expert Mode Types (`features/meals/types/expert.ts`):**
```typescript
interface RawFoodEntry { 
  id, name, category, 
  nutritionPer100g: { calories, protein, carbs, fat, fiber, sugar, sodium, cholesterol, potassium, calcium, magnesium, iron, zinc, vitaminA, vitaminB6, vitaminB12, vitaminC, vitaminD, vitaminE, vitaminK },
  cookedConversionFactor, servingUnit, defaultServing, servings?
}
interface RawFoodLog extends RawFoodEntry nutrition fields { id, foodId, foodName, category, rawWeight, logMode, cookedWeight, timestamp, mealId }
type LogMode = 'raw' | 'cooked'
interface ExpertNutritionTotals { calories, caloriesGoal, caloriesRemaining, caloriesPercentage, protein..., carbs..., fat..., fiber..., sugar..., sodium..., cholesterol..., water, waterGoal, waterRemaining, waterPercentage }
interface CompetitionPrepInputs { currentWeight, bodyFatPercentage, targetWeeklyLoss, weeksUntilShow, dailyActivity }
interface CompetitionPrepResults { maintenanceCalories, contestCalories, dailyDeficit, expectedWeeklyFatLoss, projectedStageWeight, proteinRecommendation, carbRecommendation, fatRecommendation, waterRecommendation, sodiumRecommendation, fiberRecommendation }
```

**Settings Types (`features/settings/types.ts`):**
```typescript
type WeightUnit = 'kg' | 'lb'
type ThemeMode = 'light' | 'dark' | 'system'
type Gender = 'male' | 'female' | 'other'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
type FitnessGoal = 'maintain' | 'lose' | 'gain'

interface UserSettings {
  id, weightUnit, defaultRestTimer, theme, notifications,
  age, gender, height, weight, activityLevel, goal, targetWeight, heightUnit,
  username, profilePicture?, expertMode
}
```

**Analytics Types (`features/analytics/types.ts`):**
```typescript
interface AnalyticsSummary { totalWorkouts, totalVolume, totalPRs, totalSets, totalDuration, averageWorkoutDuration, currentStreak, longestStreak, favoriteExercise }
interface WeeklyVolumePoint { day, volume }
interface StrengthProgressPoint { date, estimated1RM }
interface HeatmapDay { date, count }
interface MonthlyTrend { month, volume, workouts, duration }
```

---

## 7. Business Logic

### 7.1 Workout Logging Flow

```
User opens /workout
    ↓
WorkoutProvider loads session from localStorage (or null)
    ↓
If no session → "No active workout session" message
If session exists → WorkoutPage renders
    ↓
User interacts:
  - Edit weight/reps/RIR → WorkoutContext.updateSet() → localStorage
  - Add set → WorkoutContext.addSet() → copies last set values
  - Delete set → WorkoutContext.deleteSet()
  - Add exercise → ExercisePickerModal → WorkoutContext.addExercise()
  - Start rest timer → RestTimerContext.start()
    ↓
User clicks Finish → detectPRs() runs (Epley formula)
    ↓
WorkoutSummary shows PRs + Save button
    ↓
Save → Transaction: WorkoutRepository.saveWorkout() + HistoryRepository.save()
    ↓
Reset workout, navigate to Dashboard
```

### 7.2 Template System

```
TemplatesPage → TemplateList → TemplateCard
    ↓
Start Workout: WorkoutSessionFactory.create(template) → WorkoutContext.setSession() → navigate to /workout
Edit: Navigate to /templates/:id → TemplateEditor → ExerciseRow + ExercisePicker
Create: Prompt name → TemplateRepository.createBlank() → navigate to edit
Duplicate: TemplateRepository.duplicate() → reload
```

### 7.3 Nutrition - Basic Mode

```
MealsPage → useMealContext → useMeals hook
    ↓
MealsRepository.ensureTodayMeals() creates 4 default meals if missing
    ↓
User adds food → FoodSearchPage → NutritionService.createMealItemFromSearchResult()
    ↓
MealsRepository.addFoodToMeal() → useMeals.loadMeals() → recordProgress()
    ↓
NutritionService.calculateTotals(meals, expertMode) → NutritionTotals
    ↓
NutritionCard displays: calories, macros, remaining, progress ring
```

### 7.4 Nutrition - Expert Mode

```
MealsPage (expertMode=true) → useExpertMode hook
    ↓
State: goals, rawFoodLogs, logMode, waterIntake, mealBuilderMeals, timelineData, etc.
    ↓
RawFoodMode component:
  - User selects food from bodybuildingFoods (100+ items)
  - Enters weight + logMode (raw/cooked)
  - NutritionEngine.calculateNutritionPreview(food, weight, mode)
    ↓
    nutritionCalculator.calculateNutrition(rawNutrition, cookedNutrition?, factor, weight, mode)
    ↓
    Returns ScaledNutrition → converted to FoodNutrition
    ↓
Log added to rawFoodLogs array (localStorage persisted via useEffect)
    ↓
expertTotals (useMemo) aggregates all logs → percentages, remaining
    ↓
AI Coach: AICoachService.generateCoaching(input) with totals, goals, workouts[], weightTrend[], waterIntake
```

### 7.5 Calorie Calculation (Mifflin-St Jeor)

```
SettingsService.getSettings() → UserSettings
    ↓
calculateRequiredCalories(settings):
  BMR = 10×weight + 6.25×height - 5×age + (gender==='female' ? -161 : +5)
  TDEE = BMR × ACTIVITY_MULTIPLIERS[activityLevel]
  requiredCalories = Math.round(TDEE × GOAL_ADJUSTMENTS[goal])
    ↓
Returns: { bmr, tdee, requiredCalories, goal, activityLevel, deficitOrSurplus }
```

### 7.6 Analytics Computation

All analytics derived from `workoutSessions` table via `AnalyticsRepository.getWorkoutHistory()`:

| Metric | Computation |
|--------|-------------|
| Total Workouts | `history.length` |
| Total Volume | `sum(workout.totalVolume)` |
| Total PRs | `records.length` |
| Total Sets | `sum(exercise.sets.length)` |
| Total Duration | `sum(workout.duration)` |
| Avg Duration | `totalDuration / totalWorkouts` |
| Favorite Exercise | Max sets across all workouts |
| Current Streak | Consecutive days from today backward |
| Longest Streak | Max consecutive days in history |
| Weekly Volume | Last 7 days volume per day |
| Strength Progress | Best Epley 1RM per day per exercise |
| Heatmap | Workout count per day for 84 days |
| Monthly Trends | Aggregated by month |

### 7.7 PR Detection (Epley Formula)

```
estimated1RM = weight × (1 + reps / 30)

For each completed set in finished workout:
  - Get current PR for exerciseId from PersonalRecordRepository
  - If no PR or estimated1RM > current.estimated1RM:
      Save/update PR with { exerciseId, exerciseName, weight, reps, estimated1RM, achievedAt }
  - Collect new PRs for WorkoutSummary display
```

### 7.8 Data Export/Import

```
Export: buildBackup() → Promise.all all tables → BackupFile { metadata, database }
        downloadBackup() → Blob → <a download> click

Import: readBackupFile() → validateBackup() → restoreBackup()
        Transaction: clear all tables → bulkAdd restored data
```

---

## 8. Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.8 | Core framework |
| `react-dom` | ^19.2.8 | DOM renderer |
| `react-router-dom` | ^7.18.1 | Client-side routing |
| `dexie` | ^4.4.4 | IndexedDB wrapper (database) |
| `framer-motion` | ^12.42.2 | Animations (AnimatePresence, motion.div) |
| `recharts` | ^2.15.4 | Charts (Area, Bar, Line, Pie, Heatmap) |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `react-icons` | ^5.7.0 | Icon library (Fi, etc.) |
| `clsx` | ^2.1.1 | Conditional classNames |
| `tailwind-merge` | ^3.6.0 | Merge Tailwind classes |
| `dayjs` | ^1.11.13 | Date manipulation |
| `uuid` | ^14.0.1 | UUID generation |
| `@headlessui/react` | ^2.2.10 | Accessible UI primitives (Dialog, Menu, etc.) |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^8.1.5 | Build tool + dev server |
| `@vitejs/plugin-react` | ^6.0.4 | React plugin for Vite |
| `typescript` | ^5.9.3 | Type checking |
| `tailwindcss` | ^4.3.3 | Utility-first CSS |
| `@tailwindcss/vite` | ^4.3.3 | Vite plugin for Tailwind v4 |
| `vite-plugin-pwa` | ^1.3.0 | PWA manifest + service worker |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/uuid` | Various | TypeScript definitions |
| `eslint` | Implicit | Linting (via `npm run lint`) |

---

## 9. Performance Analysis

### Strengths

1. **Code Splitting**: Vite automatically splits by route (React.lazy not used but Vite does dynamic imports for routes)
2. **Memoization**: Heavy use of `useMemo` for derived state (totals, percentages, macro splits, micronutrients)
3. **Optimistic Updates**: Meal delete/duplicate update UI immediately
4. **Dexie Indexing**: Proper indexes on `date`, `mealId`, `exerciseId` for fast queries
5. **LocalStorage for Session**: Fast sync, survives refresh, cross-tab support
6. **PWA**: Service worker caches assets for offline

### Issues & Opportunities

| Issue | Location | Impact | Recommendation |
|-------|----------|--------|----------------|
| **No React.memo on list items** | `SetRow`, `MealItemRow`, `HistoryCard`, `TemplateCard` | Unnecessary re-renders when parent updates | Wrap in `React.memo` with proper prop comparison |
| **Inline object creation in render** | Multiple components create objects in JSX (e.g., `style={{ width: ... }}`) | GC pressure | Extract to `useMemo` or constants |
| **Large `useExpertMode` hook** | `features/meals/hooks/useExpertMode.ts` (470 lines) | All state changes trigger full re-render of MealsPage | Split into multiple hooks/contexts: `useExpertGoals`, `useRawFoodLogs`, `useWaterTracking`, `useAIInsights` |
| **Duplicate `useWorkoutTimer`** | `src/hooks/useWorkoutTimer.ts` AND `features/workout/hooks/useWorkoutTimer.ts` | Confusion, potential inconsistency | Remove duplicate, use feature-scoped version |
| **Analytics re-fetches on every render** | `AnalyticsPage` calls `AnalyticsService.getExercises()` and `getExerciseDistribution()` in useEffect but no memoization | Re-fetches on parent re-render | Wrap in `useCallback` + `useEffect` deps, or move to hook |
| **No virtualization for long lists** | `ExercisePickerModal` (100+ exercises), `HistoryPage` | Slow render on mobile | Add react-window or simple pagination |
| **Dexie queries not batched** | Multiple sequential `await db.table.toArray()` | Extra round trips | Use `Promise.all` where independent (already done in `buildBackup`) |
| **Recharts re-renders** | Charts receive new object references each render | Unnecessary chart re-renders | Memoize chart data with `useMemo` |

---

## 10. Code Quality Assessment

### Dead Code / Unused Files

| File | Issue |
|------|-------|
| `src/hooks/useWorkoutTimer.ts` | Duplicate of `features/workout/hooks/useWorkoutTimer.ts` |
| `src/services/WorkoutServices.ts` | Exports empty `WorkoutServices` class |
| `features/profile/repository/ProfileRepository.ts` | Only exports `getTemplates()` - likely legacy |
| `features/meals/services/__tests__/` | Test files exist but no test runner configured in package.json |

### Duplicate Code

| Pattern | Locations |
|---------|-----------|
| **Epley 1RM formula** | `utils/oneRepMax.ts`, `features/exercises/services/ExerciseRepository.ts`, `features/records/services/PRDetector.ts`, `features/analytics/services/AnalyticsService.ts` (inline) |
| **Date formatting** | Multiple components use `new Date().toISOString().split('T')[0]` |
| **localStorage load/save helpers** | `WorkoutContext`, `RestTimerContext` - similar patterns |
| **Nutrition calculation** | `nutritionCalculator.ts` (pure), `NutritionEngine` (delegates), `NutritionService` (legacy), `bodybuildingFoods.ts` (duplicate `calculateNutrition`) |
| **Default meal creation** | `MealsRepository.ensureTodayMeals()` and `getOrCreateMealForType()` have overlapping logic |

### Large Files (>300 lines)

| File | Lines | Concern |
|------|-------|---------|
| `features/meals/hooks/useExpertMode.ts` | ~470 | God hook - too many responsibilities |
| `features/meals/pages/MealsPage.tsx` | ~430 | Massive component with all expert tabs |
| `features/meals/services/NutritionEngine.ts` | ~635 | Large but well-organized facade |
| `features/analytics/services/AnalyticsService.ts` | ~328 | Multiple responsibilities |
| `features/meals/data/bodybuildingFoods.ts` | ~1100 | Data + logic mixed |

### Technical Debt

1. **Two nutrition calculation systems**: Legacy `NutritionService.calculateTotals` (basic) vs `NutritionEngine` (expert). Basic mode doesn't use the pure `nutritionCalculator`.
2. **Inconsistent naming**: `WorkoutSession` (context) vs `WorkoutSessionDB` (database) vs `WorkoutHistory` (analytics)
3. **Mixed concerns in MealsPage**: Basic mode + 5 expert tabs in one component with `AnimatePresence`
4. **No test infrastructure**: Tests exist but no `test` script in package.json, no Vitest/Jest config
5. **Type duplication**: `PersonalRecord` defined in both `database/types.ts` and `features/records/types.ts`
6. **Magic strings**: `'liftlog_active_workout_session'`, `'liftlog_rest_timer_state'`, `'liftlog_expert_goals'` scattered
7. **Error handling inconsistency**: Some services throw, others return `undefined`, some use toast notifications
8. **No barrel exports for types**: Types imported from deep paths

### Code Smells

- **God Hook**: `useExpertMode` manages goals, logs, water, meal builder, timeline, peak week, favorites, recent, AI insights, micronutrients, competition prep
- **God Component**: `MealsPage` handles basic + expert modes with 5 sub-tabs
- **Primitive Obsession**: Raw strings for dates, meal types, exercise IDs instead of branded types
- **Feature Envy**: `AnalyticsService` does data aggregation that could be in repository
- **Shotgun Surgery**: Adding a new meal type requires changes in constants, repository, types, components

---

## 11. Improvement Roadmap

### 🔴 Critical (Fix Immediately)

| # | Issue | Why | Effort |
|---|-------|-----|--------|
| 1 | **Duplicate `useWorkoutTimer` hooks** | Confusion, potential bugs if they diverge | Low - delete `src/hooks/useWorkoutTimer.ts` |
| 2 | **Empty `WorkoutServices.ts`** | Dead code, misleading | Low - delete file |
| 3 | **No test runner configured** | Tests exist but cannot run | Medium - add Vitest + configure |
| 4 | **Type duplication: `PersonalRecord`** | Inconsistency risk | Low - single source in `database/types.ts` |
| 5 | **Magic strings for localStorage keys** | Typos cause silent failures | Low - centralize in `shared/lib/constants.ts` |

### 🟠 High Priority (Next Sprint)

| # | Issue | Why | Effort |
|---|-------|-----|--------|
| 6 | **Split `useExpertMode` into multiple hooks** | 470-line god hook; any state change re-renders entire MealsPage | High - create `useExpertGoals`, `useRawFoodLogs`, `useWaterTracking`, `useAIInsights`, `useCompetitionPrep` |
| 7 | **Split `MealsPage` into tab components** | 430 lines; basic + 5 expert tabs in one file | High - `ExpertDashboardTab`, `FoodLogTab`, `WaterTab`, `CoachTab`, `GoalsTab` |
| 8 | **Unify nutrition calculation** | Two systems (legacy + expert); basic mode should use `nutritionCalculator` | Medium - refactor `NutritionService` to delegate to `NutritionEngine` |
| 9 | **Add `React.memo` to list item components** | `SetRow`, `MealItemRow`, `HistoryCard`, `TemplateCard`, `ExerciseRow` re-render unnecessarily | Medium - wrap with `React.memo` + custom `arePropsEqual` if needed |
| 10 | **Centralize date formatting** | Scattered `toISOString().split('T')[0]` | Low - add `formatDate` to `shared/lib/dayjs.ts` or `shared/lib/constants.ts` |

### 🟡 Medium Priority (Quality Improvements)

| # | Issue | Why | Effort |
|---|-------|-----|--------|
| 11 | **Virtualize long lists** | ExercisePicker (100+), History (unbounded) | Medium - add `@tanstack/react-virtual` or simple pagination |
| 12 | **Memoize chart data** | Recharts receives new object refs each render | Low - `useMemo` for `weeklyVolume`, `distribution`, `heatmap` |
| 13 | **Extract inline styles to CSS/Tailwind** | `style={{ width: \`${percent}%\` }}` in multiple places | Low - use Tailwind utility classes |
| 14 | **Add barrel exports for types** | Deep imports like `../../../features/meals/types/expert` | Low - create `features/meals/types/index.ts` re-exports |
| 15 | **Consistent error handling pattern** | Mix of throws, undefined returns, toasts | Medium - define `Result<T, E>` type or use `try/catch` with toast in hooks only |
| 16 | **Brand primitive types** | `string` for dates, meal types, exercise IDs | Medium - `type DateString = string & { __brand: 'DateString' }` |
| 17 | **Consolidate Epley formula** | 4+ copies | Low - export from `utils/oneRepMax.ts` everywhere |
| 18 | **Remove duplicate nutrition calc in `bodybuildingFoods.ts`** | `calculateNutrition` duplicates `nutritionCalculator` | Low - delegate to `nutritionCalculator` |

### 🟢 Low Priority (Nice to Have)

| # | Issue | Why | Effort |
|---|-------|-----|--------|
| 19 | **Add skeleton loaders for charts** | Analytics shows blank space while loading | Low - `Skeleton` variant for charts |
| 20 | **Keyboard shortcuts for workout logging** | Power users want `Enter` to complete set, `Space` for rest timer | Medium - add `useHotkeys` hook |
| 21 | **Offline queue for mutations** | Currently fails silently if offline | High - IndexedDB queue + background sync |
| 22 | **Unit tests for pure functions** | `nutritionCalculator`, `calorieCalculator`, `oneRepMax` are easily testable | Low - add Vitest + test files |
| 23 | **Storybook for UI components** | `Button`, `Card`, `SelectDialog` etc. need documentation | Medium |
| 24 | **Accessibility audit** | HeadlessUI helps but custom components need review | Medium |
| 25 | **Bundle size analysis** | `recharts`, `framer-motion`, `dexie` are heavy | Low - `vite-bundle-analyzer` |

---

## 12. Development Rules Summary

Based on this analysis, the following rules should govern future work:

### Architecture Rules
1. **Feature-scoped organization**: All code for a feature lives in `features/<feature>/` (components, hooks, services, types)
2. **Single source of truth**: `NutritionEngine` + `nutritionCalculator` for ALL nutrition math
3. **Repository pattern**: Data access isolated in `Repository` classes; services contain business logic
4. **Context for cross-cutting state**: Workout, RestTimer, Settings, Theme, Meals
5. **Derived state via `useMemo`**: Never compute in render

### Code Quality Rules
6. **No duplicate hooks/components**: Search before creating
7. **No dead code**: Delete unused files immediately
8. **Centralize constants**: Magic strings → `shared/lib/constants.ts`
9. **Brand primitive types**: Dates, IDs, enums as branded types
10. **Consistent error handling**: Try/catch in hooks → toast; services throw or return Result

### Performance Rules
11. **Memoize list items**: `React.memo` for `SetRow`, `MealItemRow`, etc.
12. **Memoize chart data**: `useMemo` for all chart props
13. **Virtualize long lists**: >50 items → pagination or virtualization
14. **Batch DB queries**: `Promise.all` for independent reads

### Process Rules
15. **Before changing a feature**: Understand it, identify affected files, explain plan
16. **Compare implementations**: If multiple approaches, document trade-offs
17. **Search before creating**: Components, hooks, utilities, services, types
18. **Extend don't duplicate**: Similar functionality → extend existing
19. **Test pure functions**: `nutritionCalculator`, `calorieCalculator`, `oneRepMax` must have tests
20. **Document architectural decisions**: Why this pattern, not that

---

## Appendix: File Count Summary

| Category | Files |
|----------|-------|
| Components | ~85 |
| Hooks | ~25 |
| Services | ~30 |
| Types/Interfaces | ~20 |
| Pages/Routes | ~15 |
| Repositories | ~10 |
| Context Providers | 5 |
| Data Files | 5 |
| Utilities | 5 |
| **Total TypeScript/TSX** | **~200** |

---

*Report generated by comprehensive codebase analysis. This serves as the baseline for all future development on LiftLog AI.*