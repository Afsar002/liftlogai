import { motion, useReducedMotion } from "framer-motion";
import { FiCalendar, FiCheck } from "react-icons/fi";

type Set = {
  weight: number;
  reps: number;
  completed: boolean;
};

type Session = {
  finishedAt: string;
  sets: Set[];
};

type Props = {
  history: Session[];
};

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Session timeline — vertical rail with date pills and completed-set rows,
 * replacing the old flat grey list. Each session shows the sets that were
 * actually completed.
 */
export default function ExerciseHistory({ history }: Props) {
  const reduceMotion = useReducedMotion();

  if (history.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 py-12 text-center dark:border-white/10">
        <div className="text-4xl">📉</div>
        <p className="mt-3 text-sm font-black text-zinc-900 dark:text-white">No sessions yet</p>
        <p className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Log this exercise in a workout to start tracking it.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FiCalendar size={15} aria-hidden="true" />
        </span>
        <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
          Session history
        </h2>
        <span className="ml-auto rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
          {history.length} sessions
        </span>
      </div>

      <ol className="relative space-y-4 pl-5">
        {history.map((session, index) => {
          const completed = session.sets.filter((set) => set.completed);
          return (
            <li key={`${session.finishedAt}-${index}`} className="relative">
              {/* Rail line */}
              {index < history.length - 1 && (
                <span className="absolute left-0 top-6 h-full w-px -translate-x-1/2 bg-zinc-200 dark:bg-white/8" aria-hidden="true" />
              )}
              {/* Dot */}
              <span className="absolute left-0 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 ring-4 ring-zinc-50 dark:ring-[#0d0d0f]" aria-hidden="true" />

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 320, damping: 28 }}
                className="rounded-3xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#141417]"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {dateLabel(session.finishedAt)}
                </p>

                <div className="mt-2.5 space-y-1.5">
                  {completed.length === 0 ? (
                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">No completed sets</p>
                  ) : (
                    completed.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-white/5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <FiCheck size={11} aria-hidden="true" />
                        </span>
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                          Set {setIndex + 1}
                        </span>
                        <span className="ml-auto text-sm font-black tabular-nums text-zinc-900 dark:text-white">
                          {set.weight} <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">kg</span>
                          <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">×</span>
                          {set.reps}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
