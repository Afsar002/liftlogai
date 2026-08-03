import { FiCalendar } from "react-icons/fi";

import HistoryCard from "./HistoryCard";
import type { HistoryGroup as HistoryGroupType } from "../types/Historygroup";

interface Props {
  group: HistoryGroupType;
  onDelete: (id: number) => void;
}

export default function HistoryGroup({
  group,
  onDelete,
}: Props) {
  return (
    <section className="mb-10">
      {/* Section Header */}

      <div className="mb-5 flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2">
          <FiCalendar
            className="text-blue-400"
            size={16}
          />

          <span className="text-sm font-semibold uppercase tracking-wider text-slate-950 dark:text-blue-300">
            {group.title}
          </span>
        </div>

        <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-800" />

        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {group.workouts.length}{" "}
          {group.workouts.length === 1
            ? "Workout"
            : "Workouts"}
        </span>
      </div>

      {/* Cards */}

      <div className="space-y-4">
        {group.workouts.map((workout) => (
          <HistoryCard
            key={workout.id}
            workout={workout}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}