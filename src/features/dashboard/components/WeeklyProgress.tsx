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
      <div className="p-5">
        <h2 className="text-lg font-semibold">
          Weekly Progress
        </h2>

        <div className="mt-5 flex justify-between">
          {days.map((day) => (
            <div
              key={day.day}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`
                  h-10
                  w-10
                  rounded-full

                  ${
                    day.done
                      ? "bg-green-500"
                      : "bg-zinc-700"
                  }
                `}
              />

              <span className="text-sm text-zinc-400">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>

    );
}