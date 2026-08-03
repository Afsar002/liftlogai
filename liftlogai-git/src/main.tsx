import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { RestTimerProvider } from "./features/workout/context/RestTimerContext";

import App from "./app/App";
import "./index.css";

import { WorkoutProvider } from "./features/workout/context/WorkoutContext";
import ThemeProvider from "./shared/providers/ThemeProvider";
import { SettingsProvider } from "./features/settings/hooks/SettingsProvider";
import { MealProvider } from "./features/meals/context/MealContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkoutProvider>
        <SettingsProvider>
          <RestTimerProvider>
            <ThemeProvider>
              <MealProvider>
                <App />
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