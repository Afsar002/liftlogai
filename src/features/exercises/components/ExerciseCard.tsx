import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import Card from "../../../shared/components/ui/Card";
import AnimatedCard from "../../../shared/components/motion/AnimatedCard";
import Badge from "../../../shared/components/ui/Badge";
import type { Exercise } from "../../../types/Exercise";
import ExerciseImage from "./ExerciseImage";

interface Props {
  exercise: Exercise;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

/**
 * Library card for a single exercise: photo/illustration, name, primary
 * muscles, equipment and difficulty. Memoized so filtering never re-renders
 * unchanged cards.
 */
function ExerciseCardInner({ exercise, isFavorite = false, onToggleFavorite }: Props) {
  const navigate = useNavigate();

  function openDetails() {
    navigate(`/exercises/${encodeURIComponent(exercise.id)}`);
  }

  return (
    <AnimatedCard className="h-full">
    <Card padding="none" hover className="h-full overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        aria-label={`View ${exercise.name}`}
        onClick={openDetails}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetails();
          }
        }}
        className="flex h-full cursor-pointer flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        <ExerciseImage exercise={exercise} className="aspect-[4/3] w-full shrink-0" alt={exercise.name} />

        <div className="flex flex-1 flex-col p-3.5">
          <div className="flex items-start justify-between gap-1">
            <h3 className="line-clamp-2 min-w-0 text-sm font-bold leading-snug text-zinc-900 dark:text-white">
              {exercise.name}
            </h3>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite(exercise.id);
                }}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                className={cnFavorite(isFavorite)}
              >
                <FiHeart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {exercise.primaryMuscles.slice(0, 3).map((muscle) => (
              <Badge key={muscle} variant="default" size="sm">
                {muscle}
              </Badge>
            ))}
            {exercise.primaryMuscles.length > 3 && (
              <Badge variant="default" size="sm">
                +{exercise.primaryMuscles.length - 3}
              </Badge>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{exercise.equipment}</span>
            <span>{exercise.difficulty}</span>
          </div>
        </div>
      </div>
    </Card>
    </AnimatedCard>
  );
}

function cnFavorite(isFavorite: boolean): string {
  return [
    // 44px touch target with negative margins so the compact visual stays tight.
    "-m-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full transition-colors",
    "focus-visible:ring-2 focus-visible:ring-emerald-500/50",
    isFavorite
      ? "bg-red-500/10 text-red-500 hover:text-red-600"
      : "text-zinc-400 hover:bg-red-500/10 hover:text-red-500 dark:text-zinc-500",
  ].join(" ");
}

export const ExerciseCard = memo(ExerciseCardInner);
export default ExerciseCard;
