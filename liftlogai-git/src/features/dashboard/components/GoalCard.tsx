const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function GoalCard() {
  const today = dayNames[new Date().getDay()];
  const goal =
    today === "Sunday"
      ? "Rest day. Recover and get ready for Monday."
      : `Complete ${today}'s workout.`;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-semibold text-slate-950 dark:text-white">
        Today's Goal
      </h2>

      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {goal}
      </p>
    </div>
  );
}