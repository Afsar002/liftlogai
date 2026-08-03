import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiRepeat, FiTrendingUp } from "react-icons/fi";

import Layout from "../../../shared/components/layout/Layout";
import Skeleton from "../../../shared/components/ui/Skeleton";
import { AnimatedPage } from "../../../shared/components/motion";
import { useExercise } from "../hooks/useExercise";
import PRCard from "../components/PRCard";
import StrengthChart from "../components/StrengthChart";
import ExerciseHistory from "../components/ExerciseHistory";

export default function ExercisePage() {
  const { name } = useParams();
  const navigate = useNavigate();

  const { history, pr, progress, loading } = useExercise(name ?? "");

  const totalSets = useMemo(
    () =>
      history.reduce(
        (sum, session: { sets: { completed: boolean }[] }) =>
          sum + session.sets.filter((set) => set.completed).length,
        0
      ),
    [history]
  );

  const latestOneRM = useMemo(
    () => (progress.length > 0 ? progress[progress.length - 1].oneRM : null),
    [progress]
  );

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton variant="rectangular" className="h-44" />
          <Skeleton variant="rectangular" className="h-28" />
          <Skeleton variant="rectangular" className="h-64" />
          <Skeleton variant="card" className="h-48" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatedPage>
        <div className="mx-auto max-w-2xl space-y-7">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 pb-5 pt-5 shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              >
                <FiArrowLeft size={14} aria-hidden="true" />
              </button>

              <span className="mt-4 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400/80">
                Exercise profile
              </span>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
                {name ?? ""}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-white/75">
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <FiCalendar size={10} aria-hidden="true" /> {history.length} sessions
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                  <FiRepeat size={10} aria-hidden="true" /> {totalSets} sets logged
                </span>
                {latestOneRM !== null && (
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                    <FiTrendingUp size={10} aria-hidden="true" /> {latestOneRM} kg 1RM
                  </span>
                )}
              </div>
            </div>
          </section>

          <PRCard weight={pr.weight} reps={pr.reps} />

          <StrengthChart data={progress} />

          <ExerciseHistory history={history} />
        </div>
      </AnimatedPage>
    </Layout>
  );
}
