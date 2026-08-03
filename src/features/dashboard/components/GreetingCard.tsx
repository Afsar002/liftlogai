import { useSettings } from "../../settings/hooks/SettingsProvider";

/**
 * Dashboard header: greeting eyebrow, large display name, date, avatar chip.
 * Accent used only on the greeting eyebrow (a "today" moment).
 */
export default function GreetingCard() {
  const { settings } = useSettings();
  const name = settings?.username || "User";
  const avatar = settings?.profilePicture;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {greeting} 👋
        </p>
        <h1 className="mt-1 truncate text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          {name}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          {dateStr}
        </p>
      </div>

      {avatar ? (
        <img
          src={avatar}
          alt="Profile"
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-emerald-500/30"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/15 to-lime-400/15 text-sm font-bold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
          {initials}
        </div>
      )}
    </div>
  );
}
