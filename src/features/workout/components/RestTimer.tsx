import {
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiSkipForward,
} from "react-icons/fi";

interface RestTimerProps {
  formatted: string;
  running: boolean;
  secondsLeft: number;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export default function RestTimer({
  formatted,
  running,
  secondsLeft,
  onPause,
  onResume,
  onReset,
  onSkip,
}: RestTimerProps) {
  if (!running && secondsLeft === 90) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-1/2 z-40 w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-center text-lg font-bold text-slate-950 dark:text-white">
        ⏱ Rest Timer
      </h2>

      <p className="mt-4 text-center text-5xl font-bold text-green-400">
        {formatted}
      </p>

      <div className="mt-6 flex justify-center gap-3">
        {running ? (
          <button
            type="button"
            onClick={onPause}
            className="rounded-xl bg-slate-100 p-3 text-slate-950 dark:bg-zinc-800 dark:text-white"
          >
            <FiPause />
          </button>
        ) : (
          <button
            type="button"
            onClick={onResume}
            className="rounded-xl bg-green-500 p-3 text-black"
          >
            <FiPlay />
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="rounded-xl bg-slate-100 p-3 text-slate-950 dark:bg-zinc-800 dark:text-white"
        >
          <FiRotateCcw />
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl bg-red-500 p-3 text-white"
        >
          <FiSkipForward />
        </button>
      </div>
    </div>
  );
}