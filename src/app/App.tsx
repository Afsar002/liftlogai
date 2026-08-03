import { lazy, Suspense, type ReactElement } from "react";
import { Routes, Route } from "react-router-dom";

import PageSkeleton from "../shared/components/ui/PageSkeleton";

// Code-split every route so each page (and its heavy dependencies — recharts,
// dexie, and the ~1MB bundled exercise dataset) only loads on demand. The
// service worker precaches all chunks, so offline support is unaffected.
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const WorkoutPage = lazy(() => import("../features/workout/pages/WorkoutPage"));
const Analytics = lazy(() => import("../features/analytics/pages/AnalyticsPage"));
const HistoryPage = lazy(() => import("../features/history/pages/HistoryPage"));
const WorkoutDetailPage = lazy(() => import("../features/history/pages/WorkoutDetailPage"));
const ProfilePage = lazy(() => import("../features/profile/pages/ProfilePage"));
const ExercisePage = lazy(() => import("../features/exercises/pages/ExercisePage"));
const TemplatesPage = lazy(() => import("../features/templates/pages/TemplatesPage"));
const EditTemplatePage = lazy(() => import("../features/templates/pages/EditTemplatePage"));
const RecordPage = lazy(() => import("../features/records/pages/RecordPage"));
const MealsPage = lazy(() => import("../features/meals/pages/MealsPage"));
const MealFoodSearchPage = lazy(() => import("../features/meals/pages/FoodSearchPage"));
const ProgressHistoryPage = lazy(() => import("../features/meals/pages/ProgressHistoryPage"));
const ProgressDetailPage = lazy(() => import("../features/meals/pages/ProgressDetailPage"));
const ExerciseLibraryPage = lazy(
  () => import("../features/exercises/pages/ExerciseLibraryPage")
);
const ExerciseDetailsPage = lazy(
  () => import("../features/exercises/pages/ExerciseDetailsPage")
);

/** Wraps a lazy route element in a Suspense boundary with a shared skeleton. */
function page(element: ReactElement) {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={page(<Dashboard />)} />
      <Route path="/workout" element={page(<WorkoutPage />)} />
      <Route path="/analytics" element={page(<Analytics />)} />
      <Route path="/history" element={page(<HistoryPage />)} />
      <Route path="/history/:id" element={page(<WorkoutDetailPage />)} />
      <Route path="/profile" element={page(<ProfilePage />)} />
      <Route path="/exercise/:name" element={page(<ExercisePage />)} />
      <Route path="/exercises" element={page(<ExerciseLibraryPage />)} />
      <Route path="/exercises/:id" element={page(<ExerciseDetailsPage />)} />
      <Route path="/templates" element={page(<TemplatesPage />)} />
      <Route path="/templates/:id" element={page(<EditTemplatePage />)} />
      <Route path="/templates/:id/edit" element={page(<EditTemplatePage />)} />
      <Route path="/records" element={page(<RecordPage />)} />
      <Route path="/meals" element={page(<MealsPage />)} />
      <Route path="/meals/search/:mealId" element={page(<MealFoodSearchPage />)} />
      <Route path="/meals/progress" element={page(<ProgressHistoryPage />)} />
      <Route path="/progress/:date" element={page(<ProgressDetailPage />)} />
    </Routes>
  );
}
