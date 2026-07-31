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
    <div
      className="
        fixed inset-0
        bg-black/70
        flex items-center justify-center
        z-50
      "
    >
      <div
        className="
          w-full
          max-w-xl
          rounded-xl
          bg-zinc-900
          p-6
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Add Exercise
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-400"
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
    </div>
  );
}