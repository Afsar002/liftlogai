import Skeleton from "./Skeleton";

/**
 * Full-page loading fallback used by Suspense boundaries.
 * Matches LiftLog AI's zinc/dark design language.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6 pb-28 sm:max-w-xl sm:px-6 md:max-w-3xl md:px-8 lg:max-w-5xl xl:max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-32" />
            <Skeleton variant="text" className="h-4 w-48" />
          </div>
          <Skeleton variant="circular" className="h-10 w-10" />
        </div>

        <Skeleton variant="card" className="h-40" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>

        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-24" />
      </div>
    </div>
  );
}

export default PageSkeleton;

