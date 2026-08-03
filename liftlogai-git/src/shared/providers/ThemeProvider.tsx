import { useEffect, useRef } from "react";
import { useSettings } from "../../features/settings/hooks/SettingsProvider";

function applyTheme(theme: "light" | "dark" | "system") {
  const html = document.documentElement;
  const body = document.body;

  // Remove dark class from both elements
  html.classList.remove("dark");
  body.classList.remove("dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      html.classList.add("dark");
      body.classList.add("dark");
    }
    html.style.colorScheme = prefersDark ? "dark" : "light";
    body.style.colorScheme = prefersDark ? "dark" : "light";
  } else {
    const isDark = theme === "dark";
    if (isDark) {
      html.classList.add("dark");
      body.classList.add("dark");
    }
    html.style.colorScheme = isDark ? "dark" : "light";
    body.style.colorScheme = isDark ? "dark" : "light";
  }

  html.dataset.theme = theme;
  body.dataset.theme = theme;
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const prevTheme = useRef<string | null>(null);

  // Apply theme whenever settings change
  useEffect(() => {
    const theme = settings?.theme ?? "dark";
    // Only apply if theme actually changed (prevents unnecessary DOM updates)
    if (prevTheme.current !== theme) {
      applyTheme(theme);
      prevTheme.current = theme;
    }
  }, [settings?.theme]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (!settings || settings.theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [settings?.theme]);

  return <>{children}</>;
}
