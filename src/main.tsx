import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";

import { RestTimerProvider } from "./features/workout/context/RestTimerContext";
import { preloadExercises } from "./features/exercises/services/ExerciseService";

import App from "./app/App";
import "./index.css";

import { WorkoutProvider } from "./features/workout/context/WorkoutContext";
import ThemeProvider from "./shared/providers/ThemeProvider";
import { SettingsProvider } from "./features/settings/hooks/SettingsProvider";
import { MealProvider } from "./features/meals/context/MealContext";

// Warm exercise cache early (non-blocking) so first search is instant
preloadExercises();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkoutProvider>
        <SettingsProvider>
          <RestTimerProvider>
            <ThemeProvider>
              <MealProvider>
                <MotionConfig reducedMotion="user">
                  <App />
                </MotionConfig>
              </MealProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "#18181b",
                    color: "#fff",
                  },
                }}
              />
            </ThemeProvider>
          </RestTimerProvider>
        </SettingsProvider>
      </WorkoutProvider>
    </BrowserRouter>
  </React.StrictMode>
);