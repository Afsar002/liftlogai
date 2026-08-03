import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import PageSkeleton from "../shared/components/ui/PageSkeleton";

import Dashboard from "../features/dashboard/pages/Dashboard";
import WorkoutPage from "../features/workout/pages/WorkoutPage";
import Analytics from "../features/analytics/pages/AnalyticsPage";
import HistoryPage from "../features/history/pages/HistoryPage";
import WorkoutDetailPage from "../features/history/pages/WorkoutDetailPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import ExercisePage from "../features/exercises/pages/ExercisePage";
import TemplatesPage from "../features/templates/pages/TemplatesPage";
import EditTemplatePage from "../features/templates/pages/EditTemplatePage";
import TemplateEditor from "../features/templates/components/TemplateEditor";
import RecordPage from "../features/records/pages/RecordPage";
import MealsPage from "../features/meals/pages/MealsPage";
import MealFoodSearchPage from "../features/meals/pages/FoodSearchPage";
import ProgressHistoryPage from "../features/meals/pages/ProgressHistoryPage";
import ProgressDetailPage from "../features/meals/pages/ProgressDetailPage";

// Code-split so the ~1MB bundled exercise dataset only loads when needed.
const ExerciseLibraryPage = lazy(
  () => import("../features/exercises/pages/ExerciseLibraryPage")
);
const ExerciseDetailsPage = lazy(
  () => import("../features/exercises/pages/ExerciseDetailsPage")
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/workout" element={<WorkoutPage />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/history/:id" element={<WorkoutDetailPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/exercise/:name" element={<ExercisePage />} />
      <Route path="/exercises" element={
        <Suspense fallback={<PageSkeleton />}>
          <ExerciseLibraryPage />
        </Suspense>
      } />
      <Route path="/exercises/:id" element={
        <Suspense fallback={<PageSkeleton />}>
          <ExerciseDetailsPage />
        </Suspense>
      } />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/templates/:id" element={<EditTemplatePage />} />
      <Route path="/templates/:id/edit" element={<EditTemplatePage />} />
      <Route path="/records" element={<RecordPage />} />
      <Route path="/meals" element={<MealsPage />} />
      <Route path="/meals/search/:mealId" element={<MealFoodSearchPage />} />
      <Route path="/meals/progress" element={<ProgressHistoryPage />} />
      <Route path="/progress/:date" element={<ProgressDetailPage />} />
    </Routes>
  );
}
