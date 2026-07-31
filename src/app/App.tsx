import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";

import { PageSkeleton } from "../shared/components/ui/PageSkeleton";

const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const WorkoutPage = lazy(() => import("../features/workout/pages/WorkoutPage"));
const Analytics = lazy(() => import("../features/analytics/pages/AnalyticsPage"));
const HistoryPage = lazy(() => import("../features/history/pages/HistoryPage"));
const WorkoutDetailPage = lazy(() => import("../features/history/pages/WorkoutDetailPage"));
const ProfilePage = lazy(() => import("../features/profile/pages/ProfilePage"));
const ExercisePage = lazy(() => import("../features/exercises/pages/ExercisePage"));
const TemplatesPage = lazy(() => import("../features/templates/pages/TemplatesPage"));
const EditTemplatePage = lazy(() => import("../features/templates/pages/EditTemplatePage"));
const TemplateEditor = lazy(() => import("../features/templates/components/TemplateEditor"));
const RecordPage = lazy(() => import("../features/records/pages/RecordPage"));
const MealsPage = lazy(() => import("../features/meals/pages/MealsPage"));
const MealFoodSearchPage = lazy(() => import("../features/meals/pages/FoodSearchPage"));
const ProgressHistoryPage = lazy(() => import("../features/meals/pages/ProgressHistoryPage"));
const ProgressDetailPage = lazy(() => import("../features/meals/pages/ProgressDetailPage"));

function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageSuspense>
            <Dashboard />
          </PageSuspense>
        }
      />
      <Route
        path="/workout"
        element={
          <PageSuspense>
            <WorkoutPage />
          </PageSuspense>
        }
      />
      <Route
        path="/analytics"
        element={
          <PageSuspense>
            <Analytics />
          </PageSuspense>
        }
      />
      <Route
        path="/history"
        element={
          <PageSuspense>
            <HistoryPage />
          </PageSuspense>
        }
      />
      <Route
        path="/history/:id"
        element={
          <PageSuspense>
            <WorkoutDetailPage />
          </PageSuspense>
        }
      />
      <Route
        path="/profile"
        element={
          <PageSuspense>
            <ProfilePage />
          </PageSuspense>
        }
      />
      <Route
        path="/exercise/:name"
        element={
          <PageSuspense>
            <ExercisePage />
          </PageSuspense>
        }
      />
      <Route
        path="/templates"
        element={
          <PageSuspense>
            <TemplatesPage />
          </PageSuspense>
        }
      />
      <Route
        path="/templates/:id"
        element={
          <PageSuspense>
            <EditTemplatePage />
          </PageSuspense>
        }
      />
      <Route
        path="/templates/:id/edit"
        element={
          <PageSuspense>
            <EditTemplatePage />
          </PageSuspense>
        }
      />
      <Route
        path="/records"
        element={
          <PageSuspense>
            <RecordPage />
          </PageSuspense>
        }
      />
      <Route
        path="/meals"
        element={
          <PageSuspense>
            <MealsPage />
          </PageSuspense>
        }
      />
      <Route
        path="/meals/search/:mealId"
        element={
          <PageSuspense>
            <MealFoodSearchPage />
          </PageSuspense>
        }
      />
      <Route
        path="/meals/progress"
        element={
          <PageSuspense>
            <ProgressHistoryPage />
          </PageSuspense>
        }
      />
      <Route
        path="/progress/:date"
        element={
          <PageSuspense>
            <ProgressDetailPage />
          </PageSuspense>
        }
      />
    </Routes>
  );
}

