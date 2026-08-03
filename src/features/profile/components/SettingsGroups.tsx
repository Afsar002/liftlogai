import { useState } from "react";
import { FiBell, FiChevronRight, FiClock, FiMoon, FiSliders } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import SelectDialog from "../../../shared/components/ui/SelectDialog";
import { useSettings } from "../../settings/hooks/SettingsProvider";

/**
 * Settings groups — four tappable tiles (unit, timer, theme, notifications)
 * arranged as a segmented grid instead of the old stacked list rows. Each tile
 * opens the same SelectDialog flows as before.
 */
export default function SettingsGroups() {
  const { settings, updateWeightUnit, updateTheme, updateRestTimer, updateNotifications } = useSettings();
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);

  const tiles = [
    {
      id: "unit",
      icon: <FiSliders size={17} aria-hidden="true" />,
      title: "Weight unit",
      value: (settings?.weightUnit ?? "kg").toUpperCase(),
      onClick: () => setWeightDialogOpen(true),
    },
    {
      id: "timer",
      icon: <FiClock size={17} aria-hidden="true" />,
      title: "Rest timer",
      value: `${settings?.defaultRestTimer ?? 90}s`,
      onClick: () => setTimerDialogOpen(true),
    },
    {
      id: "theme",
      icon: <FiMoon size={17} aria-hidden="true" />,
      title: "Theme",
      value: settings?.theme ?? "dark",
      onClick: () => setThemeDialogOpen(true),
    },
    {
      id: "notifications",
      icon: <FiBell size={17} aria-hidden="true" />,
      title: "Notifications",
      value: settings?.notifications ? "On" : "Off",
      onClick: () => updateNotifications(!settings?.notifications),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Preferences</h3>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          tap a tile to change
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={tile.onClick}
            className="group flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4 text-left shadow-sm transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/5 dark:border-white/8 dark:bg-[#141417]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:bg-white/8 dark:text-zinc-300">
              {tile.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-zinc-900 dark:text-white">
                {tile.title}
              </span>
              <span className="block truncate text-[11px] font-semibold capitalize text-zinc-400 dark:text-zinc-500">
                {tile.value}
              </span>
            </span>
            <FiChevronRight size={15} className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" aria-hidden="true" />
          </button>
        ))}
      </div>

      <SelectDialog
        open={weightDialogOpen}
        title="Weight Unit"
        selected={settings?.weightUnit ?? "kg"}
        onClose={() => setWeightDialogOpen(false)}
        onSelect={updateWeightUnit}
        options={[
          { label: "Kilograms (KG)", value: "kg" },
          { label: "Pounds (LB)", value: "lb" },
        ]}
      />
      <SelectDialog
        open={themeDialogOpen}
        title="Theme"
        selected={settings?.theme ?? "dark"}
        onClose={() => setThemeDialogOpen(false)}
        onSelect={(value) => updateTheme(value)}
        options={[
          { label: "Dark", value: "dark" },
          { label: "Light", value: "light" },
          { label: "System", value: "system" },
        ]}
      />
      <SelectDialog
        open={timerDialogOpen}
        title="Default Rest Timer"
        selected={settings?.defaultRestTimer ?? 90}
        onClose={() => setTimerDialogOpen(false)}
        onSelect={(value) => updateRestTimer(Number(value))}
        options={[
          { label: "30 Seconds", value: 30 },
          { label: "45 Seconds", value: 45 },
          { label: "60 Seconds", value: 60 },
          { label: "90 Seconds", value: 90 },
          { label: "120 Seconds", value: 120 },
        ]}
      />
    </div>
  );
}
