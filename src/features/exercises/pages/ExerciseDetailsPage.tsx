import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiHeart, FiList, FiTrendingUp } from "react-icons/fi";
import Layout from "../../../shared/components/layout/Layout";
import Card from "../../../shared/components/ui/Card";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Badge from "../../../shared/components/ui/Badge";
import EmptyState from "../../../shared/components/ui/EmptyState";
import { cn } from "../../../shared/lib/cn";
import type { Exercise } from "../../../types/Exercise";
import * as ExerciseService from "../services/ExerciseService";
import { useExerciseFavorites } from "../hooks/useExerciseFavorites";
import ExerciseImage from "../components/ExerciseImage";
import ExerciseCard from "../components/ExerciseCard";

const INFO_ROWS: { label: string; get: (exercise: Exercise) => string | null }[] = [
  { label: "Body region", get: (e) => e.bodyRegion },
  { label: "Category", get: (e) => e.category },
  { label: "Difficulty", get: (e) => e.difficulty },
  { label: "Mechanic", get: (e) => e.mechanic },
  { label: "Force", get: (e) => e.force },
  { label: "Equipment", get: (e) => e.equipment },
];

export default function ExerciseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const favorites = useExerciseFavorites();

  // Opened as an in-workout guide (?from=workout) — the header action returns
  // to the active session instead of going back in history.
  const fromWorkout = searchParams.get("from") === "workout";

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [related, setRelated] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setNotFound(false);

    ExerciseService.getExerciseById(id).then((found) => {
      if (!mounted) return;
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setExercise(found);
      ExerciseService.saveRecent(found.id);
      ExerciseService.getRelatedExercises(found.id).then((items) => {
        if (mounted) setRelated(items);
      });
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  const isFavorite = useMemo(
    () => (exercise ? favorites.isFavorite(exercise.id) : false),
    [exercise, favorites]
  );

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-white/8" />
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-white/8" />
          <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-white/8" />
        </div>
      </Layout>
    );
  }

  if (notFound || !exercise) {
    return (
      <Layout>
        <EmptyState
          icon={<FiList />}
          title="Exercise not found"
          description="This exercise isn't in the library. It may have been removed or the link is invalid."
          action={
            <button
              type="button"
              onClick={() => navigate("/exercises")}
              className="rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse the library
            </button>
          }
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back + title + favorite action */}
        <PageHeader
          back={
            fromWorkout
              ? { label: "Continue Workout", to: "/workout", ariaLabel: "Continue Workout" }
              : { label: "Back" }
          }
          title={exercise.name}
          size="detail"
          action={
            <button
              type="button"
              onClick={() => favorites.toggleFavorite(exercise.id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
              className={cn(
                "-mr-1 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
                isFavorite
                  ? "bg-red-500/10 text-red-500"
                  : "bg-zinc-100 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 dark:bg-white/8 dark:text-zinc-500"
              )}
            >
              <FiHeart size={22} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          }
        />

        {/* Hero image — animated GIF, falling back to the thumbnail */}
        <ExerciseImage
          exercise={exercise}
          className="aspect-[16/9] w-full rounded-2xl"
          alt={exercise.name}
          showGif
        />

        {/* Key facts */}
        <Card className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            {INFO_ROWS.map(({ label, get }) => {
              const value = get(exercise);
              if (!value) return null;
              return (
                <div key={label}>
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {label}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Muscles */}
        <section aria-label="Target muscles">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Target muscles
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {exercise.primaryMuscles.map((muscle) => (
              <Badge key={muscle} variant="success" size="md">
                {muscle}
              </Badge>
            ))}
            {exercise.secondaryMuscles.map((muscle) => (
              <Badge key={muscle} variant="info" size="md">
                {muscle}
              </Badge>
            ))}
          </div>
          {exercise.secondaryMuscles.length > 0 && (
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              Primary muscles are highlighted; secondary muscles are secondary.
            </p>
          )}
        </section>

        {/* Instructions */}
        <section aria-label="Instructions">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <FiList size={14} aria-hidden="true" />
            Instructions
          </h2>
          {exercise.instructions.length > 0 ? (
            <Card className="space-y-3">
              <ol className="list-none space-y-3">
                {exercise.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-white/8 dark:text-zinc-300">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No step-by-step instructions available for this exercise.
              </p>
            </Card>
          )}
        </section>

        {/* Tips */}
        {exercise.tips.length > 0 && (
          <section aria-label="Tips">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Tips
            </h2>
            <ul className="space-y-2">
              {exercise.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
                >
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section aria-label="Related exercises">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <FiTrendingUp size={14} aria-hidden="true" />
              Related exercises
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((item) => (
                <ExerciseCard
                  key={item.id}
                  exercise={item}
                  isFavorite={favorites.isFavorite(item.id)}
                  onToggleFavorite={(favId) => favorites.toggleFavorite(favId)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
