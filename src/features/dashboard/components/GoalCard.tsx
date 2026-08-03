import Card from "../../../shared/components/ui/Card";
import { FiTarget } from "react-icons/fi";

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
    <Card className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
        <FiTarget size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
          Today's Goal
        </h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {goal}
        </p>
      </div>
    </Card>
  );
}
