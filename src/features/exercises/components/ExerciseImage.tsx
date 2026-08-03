import { memo, useState } from "react";
import type { Exercise } from "../../../types/Exercise";
import { cn } from "../../../shared/lib/cn";
import {
  getExerciseGifUrl,
  getExerciseImageSources,
  getExerciseThumbnailUrl,
} from "../data/exerciseImages";

interface Props {
  exercise: Pick<Exercise, "image" | "thumbnail" | "gif" | "bodyRegion" | "name">;
  className?: string;
  imgClassName?: string;
  alt?: string;
  /**
   * Prefer the animated GIF over the static thumbnail. Used on the details
   * page; the GIF loads lazily and the thumbnail is its loading/error state.
   */
  showGif?: boolean;
}

/**
 * Lazy image for an exercise. Renders the bundled thumbnail when available and
 * falls back to a local muscle-region illustration on error. With `showGif`
 * the animated GIF becomes the primary source (thumbnail is the fallback).
 * Never blocks layout — a skeleton placeholder covers the frame while loading.
 */
function ExerciseImageInner({ exercise, className, imgClassName, alt, showGif }: Props) {
  const { primary, fallback } = getExerciseImageSources(exercise);
  const gifUrl = showGif ? getExerciseGifUrl(exercise.gif ?? null) : undefined;
  const thumbnailUrl = getExerciseThumbnailUrl(exercise.thumbnail ?? exercise.image);

  const primarySrc = gifUrl ?? primary;
  const fallbackSrc = gifUrl ? (thumbnailUrl ?? fallback) : fallback;

  const [src, setSrc] = useState<string | null>(primarySrc);
  const [loaded, setLoaded] = useState(false);
  const [fellBack, setFellBack] = useState(false);

  const currentSrc = src ?? fallbackSrc;
  const showSkeleton = !loaded && !fellBack;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-100 dark:bg-white/8",
        className
      )}
      role="img"
      aria-label={alt ?? exercise.name}
    >
      {showSkeleton && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200/80 dark:bg-white/8/80" />
      )}
      <img
        src={currentSrc}
        alt={alt ?? exercise.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setSrc(fallbackSrc);
          } else {
            setFellBack(true);
          }
        }}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-200",
          showGif && "object-contain",
          loaded || fellBack ? "opacity-100" : "opacity-0",
          imgClassName
        )}
      />
    </div>
  );
}

export const ExerciseImage = memo(ExerciseImageInner);
export default ExerciseImage;
