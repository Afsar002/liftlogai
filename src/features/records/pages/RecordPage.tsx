import { useMemo } from "react";
import Layout from "../../../shared/components/layout/Layout";
import Skeleton from "../../../shared/components/ui/Skeleton";
import { AnimatedPage } from "../../../shared/components/motion";
import { FiAward, FiTrendingUp } from "react-icons/fi";
import { usePersonalRecords } from "../hooks/usePersonalRecords";
import PRCard from "../components/PRCard";

export default function RecordPage() {
  const { records, loading } = usePersonalRecords();

  const ranked = useMemo(
    () => [...records].sort((a, b) => b.estimated1RM - a.estimated1RM),
    [records]
  );

  const top = ranked.length > 0 ? ranked[0] : null;

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton variant="rectangular" className="h-44" />
          <Skeleton variant="rectangular" className="h-24" />
          <Skeleton variant="rectangular" className="h-24" />
          <Skeleton variant="rectangular" className="h-24" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatedPage>
        <div className="mx-auto max-w-2xl space-y-7">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-6 shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
                Achievements
              </span>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
                Personal Records
              </h1>
              <p className="mt-1 text-xs font-semibold text-white/60">
                Your heaviest lifts, ranked by estimated 1RM.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
                  <FiAward size={11} aria-hidden="true" />
                  {records.length} record{records.length === 1 ? "" : "s"}
                </span>
                {top && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80">
                    <FiTrendingUp size={11} aria-hidden="true" />
                    Best 1RM {top.estimated1RM.toFixed(1)} kg
                  </span>
                )}
              </div>
            </div>
          </section>

          {records.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-white/10">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FiAward size={24} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-black text-zinc-900 dark:text-white">
                No personal records yet
              </h2>
              <p className="mx-auto mt-1 max-w-xs text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Complete a workout to set your first personal record.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ranked.map((record, index) => (
                <PRCard
                  key={record.id}
                  exercise={record.exerciseName}
                  weight={record.weight}
                  reps={record.reps}
                  estimated1RM={record.estimated1RM}
                  achievedAt={record.achievedAt}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      </AnimatedPage>
    </Layout>
  );
}
