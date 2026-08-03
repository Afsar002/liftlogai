import { useMemo } from "react";
import { FiActivity } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import { cn } from "../../../shared/lib/cn";

interface Props {
  /** completedAt ISO strings of every workout. */
  history: { completedAt: string }[];
}

const DAY_LABELS = ["M", "", "W", "", "F", "", "S"];
const WEEK_COUNT = 14;

function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

const LEVEL_CLASSES = [
  "bg-zinc-100 dark:bg-white/6",
  "bg-emerald-200 dark:bg-emerald-500/30",
  "bg-emerald-400 dark:bg-emerald-500/60",
  "bg-emerald-600 dark:bg-emerald-400",
];

/**
 * GitHub-style contribution heatmap for the last N weeks. Each day cell is
 * shaded by how many workouts were logged that day, giving an at-a-glance
 * consistency read that the old grouped list could never show.
 */
export default function ActivityHeatmap({ history }: Props) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const workout of history) {
      const key = new Date(workout.completedAt).toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [history]);

  const weeks = useMemo(() => {
    // Build week columns from the most recent Sunday backwards.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());

    const columns: Date[][] = [];
    for (let w = WEEK_COUNT - 1; w >= 0; w--) {
      const col: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(lastSunday);
        date.setDate(lastSunday.getDate() - w * 7 + d);
        col.push(date);
      }
      columns.push(col);
    }
    return columns;
  }, []);

  const activeDays = Array.from(counts.values()).filter((c) => c > 0).length;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FiActivity size={16} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Consistency</h3>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {activeDays} active days · last {WEEK_COUNT} weeks
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-5 pb-4 pt-4">
        <div className="min-w-max">
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((date, di) => {
                  const key = date.toISOString().slice(0, 10);
                  const count = counts.get(key) ?? 0;
                  const isFuture = date.getTime() > Date.now();
                  return (
                    <span
                      key={di}
                      title={`${date.toDateString()}: ${count} workout${count === 1 ? "" : "s"}`}
                      className={cn(
                        "h-[11px] w-[11px] rounded-[3px] transition-colors",
                        isFuture ? "bg-zinc-50 dark:bg-white/3" : LEVEL_CLASSES[levelFor(count)]
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            <span className="w-14">Less</span>
            {LEVEL_CLASSES.map((cls, i) => (
              <span key={i} className={cn("h-2.5 w-2.5 rounded-[3px]", cls)} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
