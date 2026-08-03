import Card from "../../../shared/components/ui/Card";

const days = [
  { day: "M", done: true },
  { day: "T", done: true },
  { day: "W", done: false },
  { day: "T", done: true },
  { day: "F", done: false },
  { day: "S", done: false },
  { day: "S", done: false },
];

export default function WeeklyProgress() {
  return (
    <Card>
      <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
        Weekly Progress
      </h2>

      <div className="mt-5 flex justify-between">
        {days.map((day) => (
          <div
            key={day.day}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                day.done
                  ? "bg-gradient-to-br from-emerald-500 to-lime-400 text-emerald-950"
                  : "bg-zinc-100 text-zinc-400 dark:bg-white/8 dark:text-zinc-500"
              }`}
            >
              ✓
            </div>
            <span className="text-sm text-zinc-400">
              {day.day}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
