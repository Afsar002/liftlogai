import { FiBell } from "react-icons/fi";

interface HeaderProps {
  name: string;
}

export default function Header({ name }: HeaderProps) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-zinc-400">{greeting} 👋</p>

        <h1 className="mt-1 text-4xl font-bold">
          {name}
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          {today}
        </p>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900
          p-3
          transition
          hover:border-green-500
        "
      >
        <FiBell size={20} />
      </button>
    </div>
  );
}