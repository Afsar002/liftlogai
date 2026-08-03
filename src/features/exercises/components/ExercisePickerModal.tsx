import { AnimatedOverlay, AnimatedPanel } from "../../../shared/components/motion/AnimatedDialog";
import ExercisePicker from "./ExercisePicker";

interface Props {
  open: boolean;
  onClose(): void;
  onSelect(id: string): void;
  existingNames?: string[];
}

export default function ExercisePickerModal({
  open,
  onClose,
  onSelect,
  existingNames = [],
}: Props) {
  if (!open) return null;

  return (
    <AnimatedOverlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <AnimatedPanel className="w-full max-w-xl">
        <div className="w-full rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-card-hover dark:border-white/8 dark:bg-[#1c1c1f]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                Add exercise
              </h2>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                Search or browse the library
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close exercise picker"
              className="rounded-xl p-2.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:hover:bg-white/8 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </div>

          <ExercisePicker
            existingNames={existingNames}
            onSelect={(id) => {
              onSelect(id);
              onClose();
            }}
          />
        </div>
      </AnimatedPanel>
    </AnimatedOverlay>
  );
}
